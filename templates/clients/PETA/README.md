# Rucksack Angular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.6.6.

## TODO
- [ ] Add cookie for express session
- [ ] Add store for auth with `expires` for session, use auth http interceptor to update `expires` to `Date.now()`, subscribe to change in `app.component.ts` and then, 10 minutes before the expire time, pop up a dialog that asks user to confirm they are still active. If they select `yes`, query `/api/users/me` and run the following code:

```typescript

let subject = new Rx.Subject();
ngOnInit() {
  this.subject
    .switchMap(period => Rx.Observable.interval(period))
    .do(() => /*Do your dialog confirm here*/))
    .take(1)
    .subscribe();
  this.subject.next(1000*60*50) // 10 mins less than an hour
  // Run the `this.subject.next(interval)` command for every store update
}


```

## Getting started

### Prerequisites

- Node.js 8.x LTS or newer
- Editor with [Editorconfig](http://editorconfig.org/) support (Recommended, some editors may require a plugin)

### Setting up

- `npm install` - Installs the required dependecies
- `npm start` - Starts the package (runs the Development server)

### Contributing

- Create new branch for your changes (name should be `firstname-feature`, like `corbin-models`)
- Commits should follow [Angular commit style](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/)
- Before creating merge request, rebase your branch to most recent `integration` (with `git rebase integration`)
- After you're done, create merge request with `integration`
 - After testing it may be merged to `master` 

## Commands

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
