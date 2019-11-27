const lazyQueue = () => {
  const events = [];
  let started = false;

  return {
    push: (event) => {
      if (started) event();
      else events.push(event);
    },
    start: () => {
      started = true;

      while (events.length >= 1) {
        events.shift()();
      }
    }
  };
}

const loadScript = (url) => {
  return new Promise((resolve, reject) => {
    const head = document.head || document.getElementsByTagName('head')[0]
    const script = document.createElement('script')
    script.async = true
    script.src = url

    head.appendChild(script)

    script.onload = resolve
    script.onerror = reject
  })
}

const track = ({category, action, label}) => {
  if (typeof ga === 'function') {
    ga('send', 'event', category, action, label);
  }
}

const trackPageView = () => {
  if (typeof ga === 'function') {
    ga('send', 'pageview');
  }
}

const install = async (Vue, { router }) => {
  const queue = lazyQueue();

  Vue.prototype.$gaTrack = (payload) => {
    queue.push(() => track(payload))
  };

  router.afterEach(() => {
    queue.push(trackPageView);
  });

  const listeners = {}

  Vue.directive('track', {
    bind(el, { arg: event, value }, vnode) {
      if (vnode.componentInstance) {
        vnode.componentInstance.$on(event, () => {
          track(value);
        });
      } else {
        listeners[el] = () => {
          track(value);
        }
        el.addEventListener(event, listeners[el])
      }
    },
    unbind(el, { arg: event }, vnode) {
      if (vnode.componentInstance) {
        vnode.componentInstance.$off(event);
      } else {
        el.removeEventListener(event, listeners[el])
      }
    }
  });

  await loadScript('https://www.google-analytics.com/analytics.js');
  ga('create', process.env.VUE_APP_GA_TRACKING, 'auto');
  queue.start();
}

export default {
  install
}
