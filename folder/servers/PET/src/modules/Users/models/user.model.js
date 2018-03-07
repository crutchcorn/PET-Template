"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = require("bcrypt");
const typeorm_1 = require("typeorm");
const role_model_1 = require("./role.model");
const path = require("path");
const config = require(path.resolve('./src/config/config'));
const generate_password_1 = require("generate-password");
const class_validator_1 = require("class-validator");
const owasp = require("owasp-password-strength-test");
const validator = new class_validator_1.Validator();
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
    return ((this.provider !== 'local' && !this.updated) || validator.isEmail(email, { require_tld: false }));
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
    return (this.provider !== 'local' ||
        (username && usernameRegex.test(username) && config.illegalUsernames.indexOf(username) < 0));
};
let User = User_1 = class User {
    /**
     * This should be changed in the future, as searching the DB by ID is horribly optimized. See more in the issue below:
     * https://github.com/typeorm/typeorm/issues/1459
     */
    generateSalt(newPass, oldPass) {
        console.log(newPass);
        console.log(oldPass);
        console.log("There should have been a salt generated");
        if (newPass && (!oldPass || oldPass !== newPass)) {
            console.log("This generates a new salt");
            this.salt = bcrypt_1.genSaltSync(8);
            this.password = this.hashPassword(newPass);
        }
    }
    preSave() {
        typeorm_1.getManager().findOneById(User_1, this.id)
            .then(newUser => {
            this.generateSalt(newUser.password);
        })
            .catch(err => {
            throw new Error(`Something went wrong while updating user\n${err}`);
        });
    }
    preUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
            const newUser = yield typeorm_1.getRepository(User_1)
                .createQueryBuilder("user")
                .addSelect("user.password")
                .where("user.id = :id", { id: this.id })
                .getOne();
            typeorm_1.getManager()
                .createQueryBuilder(User_1, 'user')
                .addSelect("user.password")
                .where("user.id = :id", { id: this.id })
                .getOne()
                .then(oldUser => {
                console.log("newUser");
                console.log(newUser);
                console.log('oldUser');
                console.log(oldUser);
                this.firstName = "Testing how `this` affects the save";
                // this.generateSalt(newUser.password, oldUser.password);
            })
                .catch(err => {
                throw new Error(`Something went wrong while updating user\n${err}`);
            });
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
            return bcrypt_1.hashSync(password, this.salt);
        }
        else {
            return password;
        }
    }
    ;
    // checking if password is valid
    authenticate(password) {
        return bcrypt_1.compareSync(password, this.password);
    }
    ;
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "displayName", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    typeorm_1.Column({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    typeorm_1.Column({ select: false }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    typeorm_1.Column({ select: false, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "salt", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "profileImageURL", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "provider", void 0);
__decorate([
    typeorm_1.ManyToMany(type => role_model_1.Role, { cascadeUpdate: true, cascadeInsert: true }),
    typeorm_1.JoinTable(),
    __metadata("design:type", Array)
], User.prototype, "roles", void 0);
__decorate([
    typeorm_1.UpdateDateColumn(),
    __metadata("design:type", Date)
], User.prototype, "updated", void 0);
__decorate([
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], User.prototype, "created", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "resetPasswordToken", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "resetPasswordExpires", void 0);
__decorate([
    typeorm_1.BeforeInsert(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], User.prototype, "preSave", null);
__decorate([
    typeorm_1.BeforeUpdate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], User.prototype, "preUpdate", null);
User = User_1 = __decorate([
    typeorm_1.Entity()
], User);
exports.User = User;
/**
 * Find possible not used username
 *  @example:
 *  var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');
 *  User.findUniqueUsername(possibleUsername, null, availableUsername => {})
 *  TODO: Make callback more type safe
 */
function findUniqueUsername(username, suffix, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const possibleUsername = `${username.toLowerCase()}${suffix || ''}`;
        // get a post repository to perform operations with post
        const userRepository = typeorm_1.getManager().getRepository(User);
        // load a post by a given post id
        const user = yield userRepository.findOne({ username: possibleUsername });
        // if post was not found return 404 to the client
        if (!user) {
            callback(possibleUsername);
        }
        else {
            return this.findUniqueUsername(username, (suffix || 0) + 1, callback);
        }
    });
}
exports.findUniqueUsername = findUniqueUsername;
;
/**
 * Generates a random passphrase that passes the owasp test
 * Returns a promise that resolves with the generated passphrase, or rejects with an error if something goes wrong.
 * NOTE: Passphrases are only tested against the required owasp strength tests, and not the optional tests.
 */
function generateRandomPassphrase() {
    return new Promise(function (resolve, reject) {
        let password = '';
        const repeatingCharacters = /(.)\\1{2,}/g;
        // iterate until the we have a valid passphrase
        // NOTE: Should rarely iterate more than once, but we need this to ensure no repeating characters are present
        while (password.length < 20 || repeatingCharacters.test(password)) {
            // build the random password
            password = generate_password_1.generate({
                length: Math.floor(Math.random() * (20)) + 20,
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
        }
        else {
            // resolve with the validated passphrase
            resolve(password);
        }
    });
}
exports.generateRandomPassphrase = generateRandomPassphrase;
var User_1;
// TODO: Add seeding? IDK if I want to or if it's needed
//# sourceMappingURL=user.model.js.map