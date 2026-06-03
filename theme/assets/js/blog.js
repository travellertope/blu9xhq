/**
 * Bluu Interactive — Blog JS
 * Table of contents, scroll progress, share buttons, archive search.
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        initTableOfContents();
        initReadProgress();
        initShareButtons();
        initArchiveSearch();
    });

    function initTableOfContents() {
        var tocList = document.getElementById('bluu-toc-list');
        var content = document.querySelector('.bluu-post-content');
        if (!tocList || !content) { return; }

        var headings = content.querySelectorAll('h2, h3');
        if (headings.length < 3) {
            var tocWrap = document.getElementById('bluu-toc-wrap');
            if (tocWrap) { tocWrap.style.display = 'none'; }
            return;
        }

        // Assign IDs and build list
        var items = [];
        headings.forEach(function (h, i) {
            if (!h.id) {
                h.id = 'heading-' + i + '-' + slugify(h.textContent);
            }
            var li = document.createElement('li');
            li.className = 'bluu-toc__item bluu-toc__item--' + h.tagName.toLowerCase();
            var a = document.createElement('a');
            a.href = '#' + h.id;
            a.textContent = h.textContent;
            a.setAttribute('aria-label', 'Jump to section: ' + h.textContent);
            a.addEventListener('click', function (e) {
                e.preventDefault();
                var target = document.getElementById(h.id);
                if (target) {
                    var headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '80', 10);
                    var top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 16;
                    window.scrollTo({ top: top, behavior: 'smooth' });
                }
            });
            li.appendChild(a);
            tocList.appendChild(li);
            items.push({ el: h, link: a });
        });

        // Scroll spy with IntersectionObserver
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    items.forEach(function (item) { item.link.classList.remove('is-active'); });
                    var active = items.find(function (item) { return item.el === entry.target; });
                    if (active) { active.link.classList.add('is-active'); }
                }
            });
        }, {
            rootMargin: '-' + (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '80', 10) + 20) + 'px 0px -60% 0px',
            threshold: 0
        });

        items.forEach(function (item) { observer.observe(item.el); });
    }

    // ── Read progress bar ──────────────────────────────────────────────────────
    function initReadProgress() {
        var bar = document.getElementById('bluu-read-progress');
        if (!bar) { return; }

        var article = document.querySelector('.bluu-post-content');
        if (!article) { return; }

        function updateProgress() {
            var docH    = document.documentElement.scrollHeight - window.innerHeight;
            var scrollY = window.pageYOffset || document.documentElement.scrollTop;
            var pct     = docH > 0 ? (scrollY / docH) * 100 : 0;
            bar.style.width = Math.min(100, Math.max(0, pct)).toFixed(2) + '%';
        }

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }

    // ── Share buttons ──────────────────────────────────────────────────────────
    function initShareButtons() {
        var nativeBtn = document.getElementById('bluu-share-native');
        var linkedinBtn = document.getElementById('bluu-share-linkedin');
        var xBtn = document.getElementById('bluu-share-x');
        var copyBtn = document.getElementById('bluu-share-copy');

        if (!nativeBtn && !copyBtn) { return; }

        var url   = window.location.href;
        var title = document.title;

        if (nativeBtn) {
            if (navigator.share) {
                nativeBtn.style.display = 'inline-flex';
                nativeBtn.addEventListener('click', function () {
                    navigator.share({ title: title, url: url }).catch(function () {});
                });
            } else {
                // Fallback: mailto
                nativeBtn.href = 'mailto:?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(url);
                nativeBtn.style.display = 'inline-flex';
            }
        }

        if (linkedinBtn) {
            linkedinBtn.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url);
        }

        if (xBtn) {
            xBtn.href = 'https://x.com/intent/tweet?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(title);
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', function () {
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(url).then(function () { showCopied(copyBtn); });
                } else {
                    var ta = document.createElement('textarea');
                    ta.value = url;
                    ta.style.cssText = 'position:fixed;opacity:0;';
                    document.body.appendChild(ta);
                    ta.focus();
                    ta.select();
                    try { document.execCommand('copy'); showCopied(copyBtn); } catch (e) {}
                    document.body.removeChild(ta);
                }
            });
        }
    }

    function showCopied(btn) {
        var orig = btn.innerHTML;
        btn.classList.add('bluu-share__btn--copied');
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
        setTimeout(function () {
            btn.classList.remove('bluu-share__btn--copied');
            btn.innerHTML = orig;
        }, 2000);
    }

    // ── Archive real-time search ───────────────────────────────────────────────
    function initArchiveSearch() {
        var input       = document.getElementById('bluu-archive-search-input');
        var clearBtn    = document.getElementById('bluu-archive-search-clear');
        var grid        = document.getElementById('bluu-post-grid');
        var pagination  = document.querySelector('.bluu-archive-pagination');
        var resultsWrap = document.getElementById('bluu-search-results');
        var resultsGrid = document.getElementById('bluu-search-results-grid');
        var resultsMeta = document.getElementById('bluu-search-results-meta');
        var spinner     = document.getElementById('bluu-search-spinner');
        var emptyMsg    = document.getElementById('bluu-search-empty');

        if (!input || !grid) { return; }

        var debounceTimer;
        var currentXhr;

        input.addEventListener('input', function () {
            var q = input.value.trim();
            clearBtn && clearBtn.classList.toggle('is-visible', q.length > 0);

            clearTimeout(debounceTimer);
            if (q.length === 0) {
                resetToGrid();
                return;
            }
            debounceTimer = setTimeout(function () { doSearch(q); }, 280);
        });

        clearBtn && clearBtn.addEventListener('click', function () {
            input.value = '';
            clearBtn.classList.remove('is-visible');
            resetToGrid();
            input.focus();
        });

        function resetToGrid() {
            if (resultsWrap) { resultsWrap.classList.remove('is-active'); }
            if (grid)        { grid.style.display = ''; }
            if (pagination)  { pagination.style.display = ''; }
        }

        function doSearch(q) {
            if (grid)       { grid.style.display = 'none'; }
            if (pagination) { pagination.style.display = 'none'; }
            if (resultsWrap){ resultsWrap.classList.add('is-active'); }
            if (resultsGrid){ resultsGrid.innerHTML = ''; }
            if (resultsMeta){ resultsMeta.innerHTML = ''; }
            if (emptyMsg)   { emptyMsg.style.display = 'none'; }
            if (spinner)    { spinner.style.display = 'flex'; }

            if (currentXhr) { currentXhr.abort(); }

            var data = new URLSearchParams();
            data.append('action', 'bluu_archive_search');
            data.append('nonce',  (typeof bluuSearch !== 'undefined') ? bluuSearch.nonce : '');
            data.append('q', q);

            currentXhr = new XMLHttpRequest();
            currentXhr.open('POST', (typeof bluuSearch !== 'undefined') ? bluuSearch.ajaxUrl : '/wp-admin/admin-ajax.php');
            currentXhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            currentXhr.onload = function () {
                if (spinner) { spinner.style.display = 'none'; }
                try {
                    var res = JSON.parse(currentXhr.responseText);
                    if (res.success && res.data && res.data.posts) {
                        renderResults(res.data.posts, res.data.total, q);
                    } else {
                        showEmpty();
                    }
                } catch (e) { showEmpty(); }
            };
            currentXhr.onerror = function () {
                if (spinner) { spinner.style.display = 'none'; }
                showEmpty();
            };
            currentXhr.send(data.toString());
        }

        function renderResults(posts, total, q) {
            if (!posts.length) { showEmpty(); return; }
            if (resultsMeta) {
                resultsMeta.innerHTML = 'Found <strong>' + total + '</strong> result' + (total !== 1 ? 's' : '') + ' for &ldquo;' + escHtml(q) + '&rdquo;';
            }
            var html = '';
            posts.forEach(function (p) {
                html += '<a href="' + escHtml(p.url) + '" class="bluu-post-card">';
                if (p.thumb) {
                    html += '<div class="bluu-post-card__image-wrap"><a href="' + escHtml(p.url) + '"><img src="' + escHtml(p.thumb) + '" alt="' + escHtml(p.title) + '" loading="lazy"></a></div>';
                }
                html += '<div class="bluu-post-card__body">';
                if (p.cat) { html += '<span class="bluu-post-card__badge">' + escHtml(p.cat) + '</span>'; }
                html += '<div class="bluu-post-card__title"><a href="' + escHtml(p.url) + '">' + escHtml(p.title) + '</a></div>';
                if (p.excerpt) { html += '<p class="bluu-post-card__subtitle">' + escHtml(p.excerpt) + '</p>'; }
                html += '<div class="bluu-post-card__meta"><span>' + escHtml(p.date) + '</span>';
                if (p.read_time) { html += '<span class="bluu-post-card__meta-sep">&middot;</span><span>' + escHtml(p.read_time) + '</span>'; }
                html += '</div>';
                html += '<span class="bluu-post-card__readmore">Read more &rarr;</span>';
                html += '</div></a>';
            });
            if (resultsGrid) { resultsGrid.innerHTML = html; }
        }

        function showEmpty() {
            if (resultsGrid) { resultsGrid.innerHTML = ''; }
            if (emptyMsg)    { emptyMsg.style.display = 'block'; }
        }

        function escHtml(str) {
            return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        }
    }

    function slugify(text) {
        return text.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 40);
    }
})();
