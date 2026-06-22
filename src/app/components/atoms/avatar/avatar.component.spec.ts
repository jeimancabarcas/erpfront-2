import { TestBed } from '@angular/core/testing';
import { AvatarAtom } from './avatar.component';

describe('AvatarAtom', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarAtom],
    }).compileComponents();
  });

  it('should create with default inputs', () => {
    const fixture = TestBed.createComponent(AvatarAtom);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.size()).toBe('md');
  });

  it('should render initials when no src provided', () => {
    const fixture = TestBed.createComponent(AvatarAtom);
    fixture.componentRef.setInput('initials', 'JD');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toBe('JD');
  });

  it('should render img when src provided', () => {
    const fixture = TestBed.createComponent(AvatarAtom);
    fixture.componentRef.setInput('src', 'https://example.com/avatar.jpg');
    fixture.componentRef.setInput('alt', 'User');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const img = el.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')).toBe('https://example.com/avatar.jpg');
    expect(img?.getAttribute('alt')).toBe('User');
  });

  it('should show initials on img error', () => {
    const fixture = TestBed.createComponent(AvatarAtom);
    fixture.componentRef.setInput('src', 'https://example.com/broken.jpg');
    fixture.componentRef.setInput('initials', 'AB');
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.imgError.set(true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toBe('AB');
    expect(el.querySelector('img')).toBeFalsy();
  });
});
