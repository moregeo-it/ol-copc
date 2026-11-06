import Retries, {MAX_ATTEMPTS} from '../../../../src/ol-copc/Retries.js';

describe('ol-copc/Retries', function () {
  beforeEach(function () {
    vi.useFakeTimers();
  });

  afterEach(function () {
    vi.useRealTimers();
  });

  it('allows the first attempt', function () {
    expect(new Retries().canTry('a')).to.equal(true);
  });

  it('delays the next attempt with an increasing delay', function () {
    const retries = new Retries();
    expect(retries.fail('a')).to.equal(1000);
    expect(retries.canTry('a')).to.equal(false);
    expect(retries.canTry('b')).to.equal(true);
    vi.advanceTimersByTime(1000);
    expect(retries.canTry('a')).to.equal(true);
    expect(retries.fail('a')).to.equal(2000);
  });

  it('gives up after the maximum number of attempts', function () {
    const retries = new Retries();
    for (let i = 1; i < MAX_ATTEMPTS; i++) {
      expect(retries.fail('a')).not.to.equal(null);
    }
    expect(retries.fail('a')).to.equal(null);
    vi.advanceTimersByTime(60000);
    expect(retries.canTry('a')).to.equal(false);
  });

  it('forgets the failures after a success', function () {
    const retries = new Retries();
    retries.fail('a');
    retries.succeed('a');
    expect(retries.canTry('a')).to.equal(true);
  });
});
