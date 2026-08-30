/* ==========================================================================
   Talk That Science — shared site behaviour
   No build step: this fetches content/*.json (edited via /admin, Decap CMS)
   and renders it straight into the page. Works on any static host.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------------- nav toggle ---------------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  /* ---------------- data fetching ---------------- */
  function fetchJSON(path) {
    return fetch(path, { cache: "no-store" }).then(function (res) {
      if (!res.ok) throw new Error("Failed to load " + path);
      return res.json();
    });
  }

  function loadEvents() {
    return fetchJSON("content/events.json")
      .then(function (data) { return (data && data.events) || []; })
      .catch(function (err) {
        console.error(err);
        return [];
      });
  }

  function loadSettings() {
    return fetchJSON("content/settings.json").catch(function (err) {
      console.error(err);
      return {};
    });
  }

  /* ---------------- helpers ---------------- */
  function formatDate(iso) {
    var d = new Date(iso + "T12:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function isUpcoming(iso) {
    var d = new Date(iso + "T23:59:59");
    return d.getTime() >= Date.now();
  }

  function sortByDate(events, ascending) {
    return events.slice().sort(function (a, b) {
      var diff = new Date(a.date) - new Date(b.date);
      return ascending ? diff : -diff;
    });
  }

  function escapeHTML(str) {
    if (!str) return "";
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function typeBadge(event) {
    if (event.type === "broadcast") {
      return '<span class="badge badge-broadcast">Echobox Broadcast</span>';
    }
    return '<span class="badge badge-live">Live · ' + escapeHTML(event.venue || "Oedipus Brewery") + "</span>";
  }

  function tagsHTML(tags, interactive) {
    if (!tags || !tags.length) return "";
    return (
      '<div class="tag-row">' +
      tags.map(function (t) {
        return interactive
          ? '<button type="button" class="tag" data-tag="' + escapeHTML(t) + '">' + escapeHTML(t) + "</button>"
          : '<span class="tag">' + escapeHTML(t) + "</span>";
      }).join("") +
      "</div>"
    );
  }

  /* ---------------- card rendering ---------------- */
  function eventCard(event, interactiveTags) {
    var upcoming = isUpcoming(event.date);
    var badges = typeBadge(event) + (upcoming ? '<span class="badge badge-upcoming">Upcoming</span>' : "");

    var audio = event.excerptAudioUrl
      ? '<audio controls preload="none" src="' + event.excerptAudioUrl + '">' +
        "Your browser can't play this excerpt. " +
        '<a href="' + event.excerptAudioUrl + '">Download the audio</a>.</audio>'
      : "";

    var actions = "";
    if (event.slideUrl) {
      actions += '<a class="btn btn-primary" href="' + event.slideUrl + '" target="_blank" rel="noopener">View Slides</a>';
    }
    if (event.episodeLink) {
      actions += '<a class="btn btn-secondary" href="' + event.episodeLink + '" target="_blank" rel="noopener">Listen to Episode</a>';
    }
    if (!actions) {
      actions = '<span class="hint" style="color:var(--muted); font-size:0.85rem;">Slides / audio coming after the show</span>';
    }

    return (
      '<article class="card">' +
      '<div class="meta-row">' + badges + "</div>" +
      '<h3 class="card-title">' + escapeHTML(event.title) + "</h3>" +
      '<div class="meta-row"><strong>' + formatDate(event.date) + "</strong> &middot; " + escapeHTML(event.guest || "") + "</div>" +
      '<p class="card-desc">' + escapeHTML(event.description || "") + "</p>" +
      tagsHTML(event.tags, interactiveTags) +
      audio +
      '<div class="card-actions">' + actions + "</div>" +
      "</article>"
    );
  }

  function timelineItem(event) {
    var isBroadcast = event.type === "broadcast";
    var where = isBroadcast ? "Echobox Radio (live broadcast)" : (event.venue || "Oedipus Brewery");
    return (
      '<div class="timeline-item ' + (isBroadcast ? "is-broadcast" : "is-live") + '">' +
      '<div class="timeline-date">' + formatDate(event.date) + "</div>" +
      '<h3 style="margin:0.2rem 0 0.15rem;">' + escapeHTML(event.title) + "</h3>" +
      '<div class="meta-row" style="margin-bottom:0.4rem;">' + typeBadge(event) + "<span>" + escapeHTML(where) + "</span></div>" +
      '<p class="card-desc">' + escapeHTML(event.description || "") + "</p>" +
      "</div>"
    );
  }

  /* ---------------- page: home ---------------- */
  function renderHome() {
    var nextEl = document.getElementById("next-event-teaser");
    var latestEl = document.getElementById("latest-episode-teaser");
    if (!nextEl && !latestEl) return;

    loadEvents().then(function (events) {
      var upcoming = sortByDate(events.filter(function (e) { return isUpcoming(e.date); }), true);
      var past = sortByDate(events.filter(function (e) { return !isUpcoming(e.date); }), false);

      if (nextEl) {
        nextEl.innerHTML = upcoming.length
          ? eventCard(upcoming[0])
          : '<div class="empty-state">No upcoming dates published yet — check back soon.</div>';
      }
      if (latestEl) {
        latestEl.innerHTML = past.length
          ? eventCard(past[0])
          : '<div class="empty-state">No past episodes published yet.</div>';
      }
    });
  }

  /* ---------------- page: events hub ---------------- */
  function renderEventsHub() {
    var upcomingWrap = document.getElementById("upcoming-events-grid");
    var pastWrap = document.getElementById("past-events-grid");
    if (!upcomingWrap && !pastWrap) return;

    var searchInput = document.getElementById("tag-search-input");
    var countEl = document.getElementById("tag-search-count");

    var currentFilter = "all";
    var currentQuery = "";
    var allEvents = [];

    function matchesQuery(event, query) {
      if (!query) return true;
      return (event.tags || []).some(function (t) {
        return t.toLowerCase().indexOf(query) !== -1;
      });
    }

    function draw() {
      var query = currentQuery.trim().toLowerCase();
      var filtered = allEvents.filter(function (e) {
        if (currentFilter !== "all" && e.type !== currentFilter) return false;
        return matchesQuery(e, query);
      });
      var upcoming = sortByDate(filtered.filter(function (e) { return isUpcoming(e.date); }), true);
      var past = sortByDate(filtered.filter(function (e) { return !isUpcoming(e.date); }), false);

      if (upcomingWrap) {
        upcomingWrap.innerHTML = upcoming.length
          ? upcoming.map(function (e) { return eventCard(e, true); }).join("")
          : '<div class="empty-state">' + (query ? "No events tagged “" + escapeHTML(currentQuery.trim()) + "”." : "Nothing upcoming in this category yet.") + "</div>";
      }
      if (pastWrap) {
        pastWrap.innerHTML = past.length
          ? past.map(function (e) { return eventCard(e, true); }).join("")
          : '<div class="empty-state">' + (query ? "No events tagged “" + escapeHTML(currentQuery.trim()) + "”." : "No past entries in this category yet.") + "</div>";
      }
      if (countEl) {
        countEl.textContent = query ? filtered.length + " match" + (filtered.length === 1 ? "" : "es") : "";
      }
    }

    loadEvents().then(function (events) {
      allEvents = events;
      draw();
    });

    var filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterButtons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        currentFilter = btn.getAttribute("data-filter");
        draw();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        currentQuery = searchInput.value;
        draw();
      });
    }

    // Clicking a tag on a card jumps straight to searching that tag.
    [upcomingWrap, pastWrap].forEach(function (wrap) {
      if (!wrap) return;
      wrap.addEventListener("click", function (e) {
        var btn = e.target.closest(".tag");
        if (!btn) return;
        var tag = btn.getAttribute("data-tag");
        if (searchInput) {
          searchInput.value = tag;
          searchInput.focus();
        }
        currentQuery = tag;
        draw();
      });
    });
  }

  /* ---------------- page: calendar ---------------- */
  function renderCalendar() {
    var wrap = document.getElementById("calendar-timeline");
    if (!wrap) return;

    loadEvents().then(function (events) {
      var upcoming = sortByDate(events.filter(function (e) { return isUpcoming(e.date); }), true);
      wrap.innerHTML = upcoming.length
        ? upcoming.map(timelineItem).join("")
        : '<div class="empty-state">Nothing scheduled yet — the next broadcast or bar night will show up here as soon as it\'s added in /admin.</div>';
    });
  }

  /* ---------------- page: about ---------------- */
  function renderAbout() {
    var missionEl = document.getElementById("about-mission");
    var storyEl = document.getElementById("about-story");
    var teamEl = document.getElementById("about-team-note");
    var venueEl = document.getElementById("about-venue");
    if (!missionEl && !storyEl && !teamEl && !venueEl) return;

    loadSettings().then(function (settings) {
      if (missionEl && settings.about) missionEl.textContent = settings.about.mission;
      if (storyEl && settings.about) storyEl.textContent = settings.about.story;
      if (teamEl && settings.about && settings.about.teamNote) teamEl.textContent = settings.about.teamNote;
      if (venueEl && settings.venue) {
        venueEl.textContent = settings.venue.name + " — " + settings.venue.address;
      }
    });
  }

  /* ---------------- forms: progressive-enhancement submit ---------------- */
  function initForms() {
    document.querySelectorAll("form[data-ajax-form]").forEach(function (form) {
      var successId = form.getAttribute("data-success-target");
      var successEl = successId ? document.getElementById(successId) : null;

      form.addEventListener("submit", function (e) {
        // Posts to the form's own `action` (a Formspree endpoint — see
        // README). Falls back to a normal POST if fetch fails.
        e.preventDefault();
        var data = new FormData(form);

        fetch(form.getAttribute("action"), {
          method: "POST",
          headers: { Accept: "application/json" },
          body: data,
        })
          .then(function (res) {
            if (!res.ok) throw new Error("Form submission failed");
          })
          .then(function () {
            form.reset();
            form.style.display = "none";
            if (successEl) successEl.classList.add("visible");
          })
          .catch(function () {
            // Fall back to a real form submission if fetch/CORS fails
            form.submit();
          });
      });
    });
  }

  /* ---------------- boot ---------------- */
  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initForms();
    renderHome();
    renderEventsHub();
    renderCalendar();
    renderAbout();
  });
})();
