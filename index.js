const API_URL = "https://tweet-api.fredgido.com/tweets?";

const PROXY_URL= "http://home.fredgido.com:7034/twitter_proxy?url=";

function TweetCard(tweet, assets, user) {
  const timestamp = dayjs((new BigNumber(tweet.id)).dividedBy(4194304).plus(1288834974657).toNumber());
  const text = tweet.hashtags
    .reduce((agg, tag) => agg.replace("#" + tag, `<a href="https://twitter.com/hashtag/${tag}">#${tag}</a>`), tweet.full_text)
    .replace(/https?:\/\/t\.co\/\w+/, "");

  let html = `
  <article>
    <a href="https://twitter.com/i/status/${tweet.id}">
      <span class="tweet-id">Tweet #${tweet.id}</span>
    </a>
    <section class="tweet-header">
      <a href="https://twitter.com/i/user/${tweet.user_id}">
        <span>${user.name}</span>
        <span>@${user.screen_name}</span>
      </a>
      <span class="tweet-timestamp" title="${timestamp}">
        ${timestamp}
      </span>
    </section>
    <section class="tweet-body">
      <p>${text}</p>
    </section>
    <section class="tweet-media">`;

  for (const asset of assets) {
    html += `
      <article id="tweet-image_${asset.id}" title="${asset.ext_alt_text ?? ""}">
        <a href="${asset.url}">
          <img
            src="${asset.url}"
            onerror="this.onerror=null;this.src='${PROXY_URL + encodeURIComponent(asset.url)}';this.style.border = '4px solid red';"
          >
        </a>
      </article>`;
  }

  html += `
    </section>
    <section class="tweet-footer">
      <span>${tweet.reply_count} replies</span>
      <span>${tweet.retweet_count} retweets</span>
      <span>${tweet.favorite_count} favs</span>
      <span>${tweet.views || '?'} views</span>
    </section>
  </article>
  `;

  return $(html);
}

function loadTweetFeed(params) {
  // fetch(API_URL + "id=1668882211574013952", {
  fetch(API_URL + new URLSearchParams(params), {
    method: "GET",
    body: undefined,
  }).then(resp => resp.text()).then(respText => JSONbig.parse(respText) ).then(tweets => {
    for (const tweetData of tweets) {
      let card = TweetCard(tweetData.post, tweetData.assets, tweetData.user[0]);
      $("#tweet-container").append(card);
    }
  }, e => {
    console.log(e);
  });
}

$(document).ready(function() {
  document.getElementById("search-form").onsubmit = function submitForm(e) {
    e.preventDefault();
    let params = Array.from($(e.target).find("td > input")).reduce((acc, el) => {
      switch (el.type) {
      case "text":
        if (el.value) {
          acc[el.attributes.name.value] = el.value;
        }
        break;
      case "checkbox":
        if (el.checked) {
          acc[el.attributes.name.value] = true;
        }
        break;
      }
      return acc;
    }, {});
    loadTweetFeed(params);
  };
});
