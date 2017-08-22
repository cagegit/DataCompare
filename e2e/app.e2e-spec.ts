import { Ng4Page } from './app.po';

describe('ng4 App', () => {
  let page: Ng4Page;

  beforeEach(() => {
    page = new Ng4Page();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
