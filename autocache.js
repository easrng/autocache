async function getTree(url){
  const { tree } = await(await fetch(url)).json();
  return (
    await Promise.all(
      tree.map(
        async e => e.type == "tree" ?
        (
          await getTree(e.url)
        ).map(o => ({...o, path: e.path+"/"+o.path})):e
      )
    )
  ).flat()
};
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('v1').then(async function(cache) {
      const repo = "easrng/gtunnel-plugins"
      const { sha } = (await(await fetch("https://api.github.com/repos/"+repo+"/deployments")).json()).filter(e=>e.environment=="github-pages")[0];
      for(let blob of await getTree("https://api.github.com/repos/"+repo+"/git/trees/"+sha)) {
        
      }
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(caches.match(event.request).then(function(response) {
    // caches.match() always resolves
    // but in case of success response will have value
    if (response !== undefined) {
      return response;
    } else {
      return fetch(event.request).then(function (response) {
        // response may be used only once
        // we need to save clone to put one copy in cache
        // and serve second one
        let responseClone = response.clone();
        
        caches.open('v1').then(function (cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(function () {
        return caches.match('/sw-test/gallery/myLittleVader.jpg');
      });
    }
  }));
});
