/**
 * Module dependencies
 */
import {use as passportUse} from 'passport';
import {Strategy as GithubStrategy} from 'passport-github';
import {saveOAuthUserProfile} from '../../controllers/users.controller';

export default function (config) {
  // Use github strategy
  passportUse(new GithubStrategy({
    clientID: config.github.clientID,
    clientSecret: config.github.clientSecret,
    callbackURL: config.github.callbackURL,
    scope: ['user:email']
    },
  function (accessToken, refreshToken, profile, done) {
    // Create the user OAuth profile
    const displayName = profile.displayName ? profile.displayName.trim() : profile.username.trim();
    const iSpace = displayName.indexOf(' '); // index of the whitespace following the firstName
    const firstName = iSpace !== -1 ? displayName.substring(0, iSpace) : displayName;
    const lastName = iSpace !== -1 ? displayName.substring(iSpace + 1) : '';

    const providerUserProfile = {
      firstName: firstName,
      lastName: lastName,
      displayName: displayName,
      email: (profile.emails && profile.emails.length) ? profile.emails[0].value : undefined,
      username: profile.username,
      profileImageURL: (profile.profileUrl) ? profile.profileUrl : undefined,
      provider: 'github',
      providerIdentifierField: 'id',
      // Set the provider data and include tokens
      providerData: {
        accessToken,
        refreshToken,
        ...(<any>profile)._json
      }
    };

    // Save the user OAuth profile
    saveOAuthUserProfile(providerUserProfile, done);
  }));
};
