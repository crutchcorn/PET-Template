import {NavShellModule} from './nav-shell.module';

describe('HomeModule', () => {
  let homeModule: NavShellModule;

  beforeEach(() => {
    homeModule = new NavShellModule();
  });

  it('should create an instance', () => {
    expect(homeModule).toBeTruthy();
  });
});
