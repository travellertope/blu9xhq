/**
 * Bluu Interactive — Blog JS
 * Table of contents generation and scroll tracking.
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        initTableOfContents();
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

    function slugify(text) {
        return text.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 40);
    }
})();
