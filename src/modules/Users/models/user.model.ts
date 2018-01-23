import {hashSync, compareSync, genSaltSync} from 'bcrypt';
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, UpdateDateColumn,
  CreateDateColumn, getManager, BeforeInsert, BeforeUpdate
} from 'typeorm';
import {Role} from './role.model';
import * as path from 'path';

const config: configReturn = require(path.resolve('./src/config/config'));
import {generate} from 'generate-password';
import {Validator} from 'class-validator';
import * as owasp from 'owasp-password-strength-test';
import * as chalk from 'chalk';
import {Post} from '../../Posts/models/post.model';
import {configReturn} from '../../../config/config';

const validator = new Validator();
owasp.config(config.shared.owasp);

/**
 * A Validation function for local strategy properties
 */
const validateLocalStrategyProperty = function (property) {
  return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy email
 */
const validateLocalStrategyEmail = function (email) {
  return ((this.provider !== 'local' && !this.updated) || validator.isEmail(email, {require_tld: false}));
};


/**
 * A Validation function for username
 * - at least 3 characters
 * - only a-z0-9_-.
 * - contain at least one alphanumeric character
 * - not in list of illegal usernames
 * - no consecutive dots: "." ok, ".." nope
 * - not begin or end with "."
 */

const validateUsername = function (username) {
  const usernameRegex = /^(?=[\w.-]+$)(?!.*[._-]{2})(?!\.)(?!.*\.$).{3,34}$/;
  return (
    this.provider !== 'local' ||
    (username && usernameRegex.test(username) && config.illegalUsernames.indexOf(username) < 0)
  );
};


@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  // TODO: Add validation with validateLocalStrategyProperty
  @Column()
  firstName: string;

  // TODO: Add validation with validateLocalStrategyProperty
  @Column()
  lastName: string;

  @Column()
  displayName: string;

  // TODO: Add validation with validateLocalStrategyEmail
  @Column()
  email: string;

  // TODO: Add lowercase unique checks. See @typeorm/typeorm/#327 and @typeorm/typeorm/#356
  // TODO: Add validation with validateUsername
  // TODO: trim
  // TODO: required
  @Column({unique: true})
  username: string;

  @Column({select: false})
  password: string;

  @Column({select: false, nullable: true})
  salt: string;

  @Column({nullable: true})
  profileImageURL: string;

  // TODO: required
  // TODO: Add enum validation
  @Column()
  provider: string;

  // TODO: Break out into table to properly store this data
  // providerData: {},
  // additionalProvidersData: {},

  // TODO: Add default of 'User'
  // TODO: Add required validation
  @ManyToMany(type => Role, {cascadeUpdate: true, cascadeInsert: true})
  @JoinTable()
  roles: Role[];

  @UpdateDateColumn()
  updated: Date;

  @CreateDateColumn()
  created: Date;

  @Column({nullable: true})
  resetPasswordToken: string;

  // TODO: Ensure this works with the Date type
  @Column({nullable: true})
  resetPasswordExpires: Date;

  /**
   * This should be changed in the future, as searching the DB by ID is horribly optimized. See more in the issue below:
   * https://github.com/typeorm/typeorm/issues/1459
   */
  generateSalt(oldPass?: string) {
    console.log(oldPass);
    console.log(this.password);
    console.log("There should have been a salt generated");
    if (this.password && (!oldPass || oldPass !== this.password)) {
      console.log("This generates a new salt");
      this.salt = genSaltSync(8);
      this.password = this.hashPassword(this.password);
    }
  }


  @BeforeInsert()
  preSave() {
    this.generateSalt();
  }

  @BeforeUpdate()
  preUpdate() {
    const entityManager = getManager();
    entityManager.findOneById(User, this.id)
      .then(user => this.generateSalt(user.password))
      .catch(err => {
        throw new Error(`Something went wrong while updating user\n${err}`);
      });
  }

  /*
  // TODO: Add pre-validate hooks
  UserSchema.pre('validate', function (next) {
    if (this.provider === 'local' && this.password && this.isModified('password')) {
      var result = owasp.test(this.password);
      if (result.errors.length) {
        var error = result.errors.join(' ');
        this.invalidate('password', error);
      }
    }
    next();
  });
  */

  hashPassword(password) {
    if (this.salt && password) {
      return hashSync(password, this.salt);
    } else {
      return password;
    }
  };

// checking if password is valid
  authenticate(password) {
    return compareSync(password, this.password);
  };
}

/**
 * Find possible not used username
 *  @example:
 *  var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');
 *  User.findUniqueUsername(possibleUsername, null, availableUsername => {})
 *  TODO: Make callback more type safe
 */
export async function findUniqueUsername(username: string, suffix: number, callback: Function) {
  const possibleUsername = `${username.toLowerCase()}${suffix || ''}`;

  // get a post repository to perform operations with post
  const userRepository = getManager().getRepository(User);

  // load a post by a given post id
  const user = await userRepository.findOne({username: possibleUsername});

  // if post was not found return 404 to the client
  if (!user) {
    callback(possibleUsername);
  } else {
    return this.findUniqueUsername(username, (suffix || 0) + 1, callback);
  }
};


/**
 * Generates a random passphrase that passes the owasp test
 * Returns a promise that resolves with the generated passphrase, or rejects with an error if something goes wrong.
 * NOTE: Passphrases are only tested against the required owasp strength tests, and not the optional tests.
 */
export function generateRandomPassphrase(): Promise<string> {
  return new Promise(function (resolve, reject) {
    let password = '';
    const repeatingCharacters = /(.)\\1{2,}/g;

    // iterate until the we have a valid passphrase
    // NOTE: Should rarely iterate more than once, but we need this to ensure no repeating characters are present
    while (password.length < 20 || repeatingCharacters.test(password)) {
      // build the random password
      password = generate({
        length: Math.floor(Math.random() * (20)) + 20, // randomize length between 20 and 40 characters
        numbers: true,
        symbols: false,
        uppercase: true,
        excludeSimilarCharacters: true
      });

      // check if we need to remove any repeating characters
      password = password.replace(repeatingCharacters, '');
    }

    // Send the rejection back if the passphrase fails to pass the strength test
    if (owasp.test(password).errors.length) {
      reject(new Error('An unexpected problem occured while generating the random passphrase'));
    } else {
      // resolve with the validated passphrase
      resolve(password);
    }
  });
}

// TODO: Add seeding? IDK if I want to or if it's needed
