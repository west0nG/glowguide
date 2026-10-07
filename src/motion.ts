import { gsap } from 'gsap';

// Each interaction owns its transient styles. CSS/native controls own the settled state.
const active = new Map<Element, gsap.Context>();
let enabled = false;
function stop(owner: Element): void {
  const context = active.get(owner);
  active.delete(owner);
  owner.removeAttribute('data-motion');
  context?.revert();
}
export function stopMotionWithin(root: Element): void {
  for (const owner of active.keys()) if (root === owner || root.contains(owner)) stop(owner);
}
function stopAll(): void { for (const owner of active.keys()) stop(owner); }
const media = gsap.matchMedia();
media.add('(prefers-reduced-motion: no-preference)', () => {
  enabled = true;
  return () => { enabled = false; stopAll(); };
});
function play(owner: Element, name: string, build: (timeline: gsap.core.Timeline) => void): void {
  stop(owner);
  if (!enabled) return;
  const context = gsap.context(() => {
    const timeline = gsap.timeline({ defaults: { ease: 'power2.out' }, onComplete: () => stop(owner) });
    build(timeline);
  }, owner);
  active.set(owner, context);
  owner.setAttribute('data-motion', name);
}
export function animateChoice(input: HTMLInputElement): void {
  const owner = input.closest('fieldset');
  if (!owner) return;
  stop(owner);
  if (!input.checked) return;
  const indicator = input.parentElement!;
  play(owner, 'choice', timeline => {
    timeline.fromTo(indicator.querySelector('.choice-check'), { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: .26 }, 0)
      .fromTo(indicator.querySelector('.choice-orbit'), { strokeDashoffset: 100, opacity: .8 }, { strokeDashoffset: 0, duration: .25 }, 0)
      .to(indicator.querySelector('.choice-orbit'), { opacity: 0, duration: .16 }, .22);
  });
}
export function animatePair(root: Element): void {
  const owner = root.querySelector('.compare-slots');
  if (!owner?.querySelector('.pair-link')) return;
  play(owner, 'pair', timeline => {
    timeline.fromTo(owner.querySelectorAll('.pair-line'), { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: .28 }, 0)
      .fromTo(owner.querySelector('.pair-seal'), { opacity: 0 }, { opacity: 1, duration: .22 }, .2)
      .fromTo(owner.querySelectorAll('.pair-flash'), { opacity: .65 }, { opacity: 0, duration: .32 }, .22);
  });
}
export function animateScan(root: Element): void {
  const owner = root.querySelector('.scan-view');
  if (!owner) return;
  play(owner, 'scan', timeline => {
    owner.querySelectorAll('.scan-corners i').forEach((corner, index) => {
      timeline.fromTo(corner, { x: index === 0 || index === 3 ? 8 : -8, y: index < 2 ? 8 : -8, opacity: .4 }, { x: 0, y: 0, opacity: 1, duration: .22 }, 0);
    });
    timeline.fromTo(owner.querySelector('.scan-line'), { yPercent: -110, opacity: 0 }, { yPercent: 400, opacity: .65, duration: .6, ease: 'power1.inOut' }, .14)
      .to(owner.querySelector('.scan-line'), { opacity: 0, duration: .1 }, .74);
  });
}
// Capture settled positions before replacing a filtered collection. Read all bounds
// together; animate only transforms afterwards, compensating for the iPad CSS zoom.
export type CollectionPositions = Map<string, { x: number; y: number }>;
export function captureCollection(root: Element): CollectionPositions {
  stopMotionWithin(root);
  const bounds = root.getBoundingClientRect();
  return new Map([...root.querySelectorAll<HTMLElement>('[data-motion-key]')].map(item => {
    const rect = item.getBoundingClientRect();
    return [item.dataset.motionKey!, { x: rect.left - bounds.left, y: rect.top - bounds.top }];
  }));
}
export function animateCollection(root: Element, before: CollectionPositions, name: 'results' | 'picker-results'): void {
  const bounds = root.getBoundingClientRect();
  const items = [...root.querySelectorAll<HTMLElement>('[data-motion-key]')].map(item => {
    const rect = item.getBoundingClientRect();
    const previous = before.get(item.dataset.motionKey!);
    const zoom = rect.width / item.offsetWidth || 1;
    return { item, previous, opacity: Number(getComputedStyle(item).opacity), x: previous ? (previous.x - rect.left + bounds.left) / zoom : 0,
      y: previous ? (previous.y - rect.top + bounds.top) / zoom : 10 };
  });
  play(root, name, timeline => {
    items.forEach(({ item, previous, opacity, x, y }, index) => {
      const clamp = (value: number) => Math.max(-120, Math.min(120, value));
      timeline.fromTo(item, { x: clamp(x), y: clamp(y), opacity: previous ? opacity : opacity * .35 },
        { x: 0, y: 0, opacity, duration: .32 }, previous ? 0 : Math.min(index * .025, .12));
    });
    const status = root.querySelector('.result-count, .empty-state, .picker-empty');
    if (status) timeline.fromTo(status, { opacity: .45 }, { opacity: 1, duration: .24 }, 0);
  });
}
export function animateNavigation(root: Element): void {
  const marker = root.querySelector('.nav-item.active .nav-confirm');
  if (!marker) return;
  play(marker, 'navigation', timeline => {
    timeline.fromTo(marker, { scaleX: .1, opacity: 1, transformOrigin: '50% 50%' }, { scaleX: 1, duration: .24 }, 0)
      .to(marker, { opacity: 0, duration: .18 }, .24);
  });
}
export function animateGlossary(details: HTMLDetailsElement): void {
  stopMotionWithin(details);
  if (!details.open) return;
  const rows = details.querySelectorAll('.glossary-caption, .glossary-row');
  play(details, 'glossary', timeline => {
    timeline.fromTo(rows, { y: -6, opacity: .2 }, { y: 0, opacity: 1, stagger: .04, duration: .25 }, 0);
  });
}
export function animateSlot(root: Element, index: number): void {
  const owner = root.querySelectorAll('.compare-slot')[index];
  if (!owner) return;
  play(owner, 'slot', timeline => {
    timeline.fromTo(owner.querySelector('.slot-image'), { scale: .97, opacity: .7 }, { scale: 1, opacity: 1, duration: .32 }, 0)
      .fromTo(owner.querySelector('.pair-flash'), { opacity: .65 }, { opacity: 0, duration: .4 }, 0);
  });
}
export function animatePress(control: HTMLElement): void {
  if (control.matches(':disabled')) return;
  // Animate the photograph inside product links; controls use a small, brief press.
  const target = control.querySelector('.product-photo') ?? control;
  play(control, 'press', timeline => {
    timeline.to(target, { scale: .965, duration: .09 }, 0)
      .to(target, { scale: 1, duration: .19, ease: 'power2.out' }, .09);
  });
}
if (import.meta.hot) import.meta.hot.dispose(() => { media.revert(); stopAll(); });
