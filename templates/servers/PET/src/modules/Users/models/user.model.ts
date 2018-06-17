import {hashSync, compareSync, genSaltSync} from 'bcrypt';
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, UpdateDateColumn,
  CreateDateColumn, getManager, BeforeInsert, BeforeUpdate, getRepository, OneToMany
} from 'typeorm';
import {Role} from './role.model';
import {resolve} from 'path';

const config: configReturn = require(resolve('./src/config/config'));
import {generate} from 'generate-password';
import {ValidateIf, ValidationArguments, Validator} from 'class-validator';
import {config as owaspConfig, test as testPass} from 'owasp-password-strength-test';
import {Post} from '../../Posts/models/post.model';
import {configReturn} from '../../../config/config';

const validator = new Validator();
owaspConfig(config.shared.owasp);

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

const getPassErrors = (pass: string): string => {
  if (this.provider === 'local' && pass) {
    const result = testPass(pass);
    if (result.errors.length) {
      return result.errors.join(' ');
    } else {
      return '';
    }
  }
};

const validatePass = (pass: string): boolean => {
  return !!getPassErrors(pass);
};


@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @ValidateIf(validateLocalStrategyProperty)
  firstName: string;

  @Column()
  @ValidateIf(validateLocalStrategyProperty.bind(this))
  lastName: string;

  @Column()
  displayName: string;

  @Column()
  @ValidateIf(validateLocalStrategyEmail.bind(this))
  email: string;

  // TODO: Add lowercase unique checks. See @typeorm/typeorm/#327 and @typeorm/typeorm/#356
  // TODO: trim
  @Column({unique: true})
  @ValidateIf(validateUsername.bind(this))
  username: string;

  @Column({select: false, nullable: true})

  @ValidateIf(validatePass, {
    message: (args: ValidationArguments) => getPassErrors(args.value)
  })
  password: string;

  @Column({select: false, nullable: true})
  salt: string;

  @Column({nullable: true})
  profileImageURL: string;

  // TODO: required
  // TODO: Add enum validation
  @Column()
  provider: string;
  // findUniqueUsername

  @Column('json', {nullable: true})
  providerData: any;

  @Column('json', {nullable: true})
  additionalProvidersData: any;

  // TODO: Add default of 'User'
  // TODO: Add required validation
  @ManyToMany(type => Role, {cascade: ["update", "insert"]})
  @JoinTable()
  roles: Role[];

  @UpdateDateColumn()
  updated: Date;

  @CreateDateColumn()
  created: Date;

  @Column({nullable: true})
  resetPasswordToken: string;

  @Column({nullable: true})
  resetPasswordExpires: Date;

  @OneToMany(type => Post, post => post.user)
  posts: Post[];

  /**
   * This should be changed in the future, as searching the DB by ID is horribly optimized. See more in the issue below:
   * https://github.com/typeorm/typeorm/issues/1459
   */
  generateSalt(newPass: string, oldPass?: string) {
    if (newPass && (!oldPass || oldPass !== newPass)) {
      console.log("This generates a new salt");
      this.salt = genSaltSync(8);
      this.password = this.hashPassword(newPass);
    }
  }


  @BeforeInsert()
  preSave() {
    if (this.password) {
      this.generateSalt(this.password);
    }
  }

  // In order for this to change the user password, the user being called on must have had access to the password
  // by doing a select like the one found below
  @BeforeUpdate()
  async preUpdate() {
    const oldUser = await getRepository(User)
      .createQueryBuilder("user")
      .addSelect("user.password")
      .addSelect("user.salt")
      .where("user.id = :id", { id: this.id })
      .getOne();

   this.generateSalt(this.password, oldUser.password);
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
 *  TODO: Actually function plz :|
 */
export const findUniqueUsername = (username: string, suffix?: number, tries: number = 0) => new Promise<string>(async (resolve, reject) => {
  const possibleUsername = `${username.toLowerCase()}${suffix || ''}`;

  const userRepository = getManager().getRepository(User);

  try {
    const user = await userRepository.findOne({username: possibleUsername});

    if (!user) {
      resolve(possibleUsername);
    } else {
      resolve(this.findUniqueUsername(username, (suffix || 0) + 1, tries + 1));
    }
  } catch (err) {
    reject(err);
  }
});


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
    if (testPass(password).errors.length) {
      reject(new Error('An unexpected problem occured while generating the random passphrase'));
    } else {
      // resolve with the validated passphrase
      resolve(password);
    }
  });
}
