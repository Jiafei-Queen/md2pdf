(() => {
    'use strict';

    // ── DOM ──────────────────────────────────────────

    const $ = (s) => document.querySelector(s);
    const editor          = $('#editor');
    const preview         = $('#preview');
    const fileNameEl      = $('#fileName');
    const themeToggle     = $('#themeToggle');
    const exportBtn       = $('#exportBtn');
    const exportDropdown  = $('#exportDropdown');
    const exportPDFBtn    = $('#exportPDFBtn');
    const exportPDFPagesBtn = $('#exportPDFPagesBtn');
    const exportHTMLBtn   = $('#exportHTMLBtn');
    const exportMarkdownBtn = $('#exportMarkdownBtn');
    const uploadBtn       = $('#uploadBtn');
    const fileInput       = $('#fileInput');
    const dropOverlay     = $('#dropOverlay');
    const exportOverlay   = $('#exportOverlay');
    const resizeHandle    = $('#resizeHandle');
    const editorPane      = $('#editorPane');
    const previewPane     = $('#previewPane');
    const styleSelect     = $('#styleSelect');
    const customCSSToggle = $('#customCSSToggle');
    const customCSSPanel  = $('#customCSSPanel');
    const customCSSInput  = $('#customCSS');
    const styleOverride   = $('#style-override');
    const customOverride  = $('#custom-css-override');
    const counterEl       = $('#counter');
    const toastEl         = $('#toast');
    const toastMsg        = $('#toastMessage');
    const viewToggle      = $('#viewToggle');
    const workspace       = $('.workspace');
    const fullscreenBtn   = $('#fullscreenBtn');
    const exportImageBtn  = $('#exportImageBtn');
    const exportImagePagesBtn = $('#exportImagePagesBtn');
    const shareBtn        = $('#shareBtn');
    const findPanel       = $('#findPanel');
    const findInput       = $('#findInput');
    const findCount       = $('#findCount');
    const findPrevBtn     = $('#findPrevBtn');
    const findNextBtn     = $('#findNextBtn');
    const findCloseBtn    = $('#findCloseBtn');
    const replaceToggleBtn= $('#replaceToggleBtn');
    const replaceRow      = $('#replaceRow');
    const replaceInput    = $('#replaceInput');
    const replaceBtn      = $('#replaceBtn');
    const replaceAllBtn   = $('#replaceAllBtn');
    const previewContainer= $('.preview-container');
    const langToggle      = $('#langToggle');

    // ── State ────────────────────────────────────────

    let currentFileName = 'untitled.md';
    let currentStyle    = 'github';
    let currentLang     = 'en';
    let renderTimer     = null;
    let renderGeneration = 0;
    let renderPromise   = Promise.resolve();
    let renderError     = null;
    let saveTimer       = null;
    // Derived from the active doc — the single source of truth is docs[].shared
    let isSharedView    = false;

    // ── Doc store ─────────────────────────────────────
    // docs: [{ id, name, content, style, selStart, selEnd, scrollRatio, shared }]
    let docs = [];
    let activeDocId = null;   // null means the editor is detached (no tab)
    let _nextDocId = 1;

    // ── i18n ─────────────────────────────────────────

    const I18N = {
        en: {
            markdown: 'Markdown', preview: 'Preview',
            export: 'Export', exportPdf: 'PDF', exportPdfPages: 'PDF (A4)', exportHtml: 'HTML',
            exportImage: 'Image', shareLink: 'Share Link',
            exportMarkdown: 'Markdown',
            templates: 'Templates', upload: 'Upload',
            blankDoc: 'Blank document', cvResume: 'CV / Resume', report: 'Report',
            docs: 'Documentation', changelog: 'Changelog', meeting: 'Meeting Notes',
            find: 'Find...', replace: 'Replace...',
            replaceBtn: 'Replace', replaceAll: 'All',
            builtBy: 'Built by', starGithub: 'Star on GitHub',
            authorName: 'Jiafei', authorUrl: 'https://github.com/Jiafei-Queen/md2pdf',
            apiPrompts: 'AI Skill',
            linkCreated: 'Link created!', linkHint: 'Link expires 90 days after last update.',
            copy: 'Copy', copied: 'Copied!',
            download: 'Download',
            tabSkill: 'Skill', tabApi: 'API',
            generatingPdf: 'Generating PDF...', generatingImage: 'Generating Image...',
            exportImagePages: 'Images (A4)', imgPaging: 'Generating page images...', imgZipped: 'Downloaded {n} page images',
            generatingHtml: 'Generating HTML...', sharing: 'Creating link...',
            dropHere: 'Drop your <strong>.md</strong> file here',
            emptyPreview: 'Start typing to see the preview...',
            words: 'words', minRead: 'min',
            nothingToShare: 'Nothing to share', creatingLink: 'Creating link...',
            linkCopied: 'Link copied!', linkUpdated: 'Link updated',
            shareFailed: 'Share failed', docTooLarge: 'Share failed — document too large',
            draftRestored: 'Draft restored', templateLoaded: 'Template loaded',
            newDocument: 'New document', sharedDocLoaded: 'Shared document loaded',
            readOnlyTitle: 'Read-only document',
            readOnlyBody: 'This is a shared document. To make changes, create your own editable copy — the original stays untouched and you can refresh this link anytime to see updates.',
            createCopyBtn: 'Create editable copy', cancelBtn: 'Cancel',
            copyCreated: 'Editable copy created',
            sharedLockTip: 'Read-only shared document',
            imgDownloaded: 'Image downloaded', htmlDownloaded: 'HTML downloaded',
            mdDownloaded: 'Markdown downloaded',
            exportFailed: 'Export failed.',
            storageFull: 'Storage full — some changes may not persist',
            closeTab: 'Close tab',
            sidebarTitle: 'Documents', newDocumentTab: 'New document',
            collapseSidebar: 'Collapse sidebar', expandSidebar: 'Expand sidebar',
            replaced: 'Replaced {n} occurrences',
            decryptFailed: 'Could not decrypt document. The link may be incomplete.',
            encryptedShare: 'Encrypted at rest',
            tocTitle: 'Table of Contents',
            customCssPlaceholder: '/* Custom CSS — applied to preview & PDF */\n\n/* Example: colored headings */\n.markdown-body h1, .markdown-body h2 {\n  color: #6366f1;\n}\n\n/* Example: rounded code blocks */\n.markdown-body pre {\n  border-radius: 16px;\n}',
            editorPlaceholder: 'Write or drop your Markdown here...',
            // Skill tab
            skillDesc: 'Install this skill in Claude, custom GPTs, or any AI agent to let it create and share styled documents via MD2PDF.',
            // API tab
            apiDesc: 'REST API for programmatic access. No authentication required.',
            apiCreate: 'Create document', apiUpdate: 'Update document',
            apiCurl: 'cURL examples', apiLimits: 'Limits',
        },
        es: {
            markdown: 'Markdown', preview: 'Vista previa',
            export: 'Exportar', exportPdf: 'Exportar PDF', exportPdfPages: 'PDF (páginas A4)', exportHtml: 'Exportar HTML',
            exportImage: 'Exportar Imagen', shareLink: 'Compartir',
            exportMarkdown: 'Markdown',
            templates: 'Plantillas', upload: 'Subir',
            blankDoc: 'Documento en blanco', cvResume: 'CV / Hoja de vida', report: 'Reporte',
            docs: 'Documentacion', changelog: 'Changelog', meeting: 'Notas de reunion',
            find: 'Buscar...', replace: 'Reemplazar...',
            replaceBtn: 'Reemplazar', replaceAll: 'Todo',
            builtBy: 'Creado por', starGithub: 'Estrella en GitHub',
            authorName: 'Jiafei', authorUrl: 'https://github.com/Jiafei-Queen/md2pdf',
            apiPrompts: 'Skill de IA',
            linkCreated: 'Enlace creado!', linkHint: 'El enlace expira 90 dias despues de la ultima actualizacion.',
            copy: 'Copiar', copied: 'Copiado!',
            download: 'Descargar',
            tabSkill: 'Skill', tabApi: 'API',
            generatingPdf: 'Generando PDF...', generatingImage: 'Generando imagen...',
            exportImagePages: 'Imágenes (páginas A4)', imgPaging: 'Generando imágenes...', imgZipped: '{n} imágenes descargadas',
            generatingHtml: 'Generando HTML...', sharing: 'Creando enlace...',
            dropHere: 'Suelta tu archivo <strong>.md</strong> aqui',
            emptyPreview: 'Empieza a escribir para ver la vista previa...',
            words: 'palabras', minRead: 'min',
            nothingToShare: 'Nada que compartir', creatingLink: 'Creando enlace...',
            linkCopied: 'Enlace copiado!', linkUpdated: 'Enlace actualizado',
            shareFailed: 'Error al compartir', docTooLarge: 'Error — documento muy grande',
            draftRestored: 'Borrador restaurado', templateLoaded: 'Plantilla cargada',
            newDocument: 'Nuevo documento', sharedDocLoaded: 'Documento compartido cargado',
            readOnlyTitle: 'Documento de solo lectura',
            readOnlyBody: 'Este es un documento compartido. Para hacer cambios, crea tu propia copia editable — el original queda intacto y puedes recargar este enlace cuando quieras para ver actualizaciones.',
            createCopyBtn: 'Crear copia editable', cancelBtn: 'Cancelar',
            copyCreated: 'Copia editable creada',
            sharedLockTip: 'Documento compartido de solo lectura',
            imgDownloaded: 'Imagen descargada', htmlDownloaded: 'HTML descargado',
            mdDownloaded: 'Markdown descargado',
            exportFailed: 'Error al exportar.',
            storageFull: 'Almacenamiento lleno — algunos cambios podrían no guardarse',
            closeTab: 'Cerrar pestaña',
            sidebarTitle: 'Documentos', newDocumentTab: 'Nuevo documento',
            collapseSidebar: 'Contraer barra lateral', expandSidebar: 'Expandir barra lateral',
            replaced: '{n} ocurrencias reemplazadas',
            decryptFailed: 'No se pudo descifrar el documento. El enlace puede estar incompleto.',
            encryptedShare: 'Cifrado en reposo',
            tocTitle: 'Tabla de Contenido',
            customCssPlaceholder: '/* CSS personalizado — se aplica al preview y PDF */\n\n/* Ejemplo: titulos con color */\n.markdown-body h1, .markdown-body h2 {\n  color: #6366f1;\n}\n\n/* Ejemplo: bloques de codigo redondeados */\n.markdown-body pre {\n  border-radius: 16px;\n}',
            editorPlaceholder: 'Escribe o arrastra tu Markdown aqui...',
            // Skill tab
            skillDesc: 'Instala esta skill en Claude, GPTs personalizados, o cualquier agente de IA para que pueda crear y compartir documentos con MD2PDF.',
            // API tab
            apiDesc: 'API REST para acceso programatico. No requiere autenticacion.',
            apiCreate: 'Crear documento', apiUpdate: 'Actualizar documento',
            apiCurl: 'Ejemplos cURL', apiLimits: 'Limites',
        },
    };

    // Installable stub — this is what users copy into their AI agents.
    // The agent fetches the full instructions from /skill.md at runtime.
    const SKILL_INSTALLABLE = `---
name: md2pdf
description: Create and share styled PDF, HTML, and image documents from Markdown via md2pdf.studio. Use when the user wants to export, share, or create a visually styled document from markdown content.
---

Before creating or sharing a document, always fetch the latest skill instructions from:
https://md2pdf.studio/skill.md

Follow those instructions exactly.
`;

    function t(key) { return I18N[currentLang]?.[key] || I18N.en[key] || key; }

    function applyLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('md2pdf-lang', lang);
        langToggle.textContent = lang.toUpperCase();
        document.documentElement.lang = lang;

        // Static UI elements
        $('#editorPane .pane-label').innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> ' + t('markdown');
        $('#previewPane .pane-label').innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> ' + t('preview');

        $('#exportBtn span').textContent = t('export');
        $('#exportPDFBtn').lastChild.textContent = ' ' + t('exportPdf');
        $('#exportPDFPagesBtn').lastChild.textContent = ' ' + t('exportPdfPages');
        $('#exportHTMLBtn').lastChild.textContent = ' ' + t('exportHtml');
        $('#exportMarkdownBtn').lastChild.textContent = ' ' + t('exportMarkdown');
        $('#exportImageBtn').lastChild.textContent = ' ' + t('exportImage');
        $('#exportImagePagesBtn').lastChild.textContent = ' ' + t('exportImagePages');
        $('#shareBtn').lastChild.textContent = ' ' + t('shareLink');

        // Templates
        document.querySelector('[data-template="blank"]').textContent = t('blankDoc');
        document.querySelector('[data-template="cv"]').textContent = t('cvResume');
        document.querySelector('[data-template="report"]').textContent = t('report');
        document.querySelector('[data-template="docs"]').textContent = t('docs');
        document.querySelector('[data-template="changelog"]').textContent = t('changelog');
        document.querySelector('[data-template="meeting"]').textContent = t('meeting');

        // Sidebar
        const _sbTitle = document.querySelector('.doc-sidebar-title');
        if (_sbTitle) _sbTitle.textContent = t('sidebarTitle');
        const _newBtn = document.getElementById('docNewBtn');
        if (_newBtn) {
            _newBtn.title = t('newDocumentTab') + ' (Ctrl+Alt+T)';
            _newBtn.setAttribute('aria-label', t('newDocumentTab'));
        }
        const _sbToggle = document.getElementById('docSidebarToggle');
        if (_sbToggle) {
            const _collapsed = document.getElementById('docSidebar').classList.contains('collapsed');
            _sbToggle.title = _collapsed ? t('expandSidebar') : t('collapseSidebar');
            _sbToggle.setAttribute('aria-label', _sbToggle.title);
        }

        // Find & Replace
        $('#findInput').placeholder = t('find');
        $('#replaceInput').placeholder = t('replace');
        $('#replaceBtn').textContent = t('replaceBtn');
        $('#replaceAllBtn').textContent = t('replaceAll');

        // Footer
        $('.footer-brand').innerHTML = t('builtBy') + ' <a href="' + t('authorUrl') + '" target="_blank" rel="noopener">' + t('authorName') + '</a>';

        // Editor & Preview
        editor.placeholder = t('editorPlaceholder');
        $('#customCSS').placeholder = t('customCssPlaceholder');
        $('#dropOverlay .drop-content p').innerHTML = t('dropHere');
        $('.export-modal p').textContent = t('generatingPdf');
        // Share modal
        $('#shareModalTitle').textContent = t('linkCreated');
        $('#apiModalTitle').textContent = t('apiPrompts');
        $('.share-hint').textContent = t('linkHint');
        shareCopyBtn.textContent = t('copy');

        // Fork (editable copy) modal
        $('#forkModalTitle').textContent = t('readOnlyTitle');
        $('#forkModalBody').textContent = t('readOnlyBody');
        $('#forkCancelBtn').textContent = t('cancelBtn');
        $('#forkConfirmBtn').textContent = t('createCopyBtn');
        const _lockBtn = $('#sharedLock');
        _lockBtn.title = t('sharedLockTip');
        _lockBtn.setAttribute('aria-label', t('sharedLockTip'));

        // API modal
        $('#apiPromptsBtn').title = t('apiPrompts');
        $('#apiPromptsBtn').setAttribute('aria-label', t('apiPrompts'));
        $('#apiPromptsBtnLabel').textContent = t('apiPrompts');

        // Tab labels
        $('#tabBtnSkill').textContent = t('tabSkill');
        $('#tabBtnApi').textContent = t('tabApi');

        // Rebuild Skill/API content
        buildSkillTab();
        buildApiTab();
    }

    function buildSkillTab() {
        var html = '<p class="api-desc">' + t('skillDesc') + '</p>';
        html += '<div class="api-section">';
        html += '<h4>SKILL.md</h4>';
        html += '<div class="api-code-block">';
        html += '<pre>' + escapeHtmlLight(SKILL_INSTALLABLE) + '</pre>';
        html += '<div class="api-code-actions">';
        html += '<button class="api-copy-btn" id="skillCopyBtn">' + t('copy') + '</button>';
        html += '<button class="api-copy-btn" id="skillDownloadBtn">' + t('download') + '</button>';
        html += '</div>';
        html += '</div>';
        html += '</div>';

        $('#tab-skill').innerHTML = html;

        // Bind copy
        $('#skillCopyBtn').addEventListener('click', function () {
            navigator.clipboard.writeText(SKILL_INSTALLABLE).then(function () {
                $('#skillCopyBtn').textContent = t('copied');
                setTimeout(function () { $('#skillCopyBtn').textContent = t('copy'); }, 2000);
            });
        });

        // Bind download
        $('#skillDownloadBtn').addEventListener('click', function () {
            var blob = new Blob([SKILL_INSTALLABLE], { type: 'text/markdown;charset=utf-8' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'SKILL.md';
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    function buildApiTab() {
        var html = '<p class="api-desc">' + t('apiDesc') + '</p>';

        var sections = [
            { title: t('apiCreate'), code: 'POST https://md2pdf.studio/api/save\nContent-Type: text/plain\n\n# Your markdown here\n\n---\nResponse 200:\n{\n  "id": "BrOrr0N3",\n  "editKey": "a1b2c3...64chars",\n  "url": "https://md2pdf.studio/s/BrOrr0N3",\n  "key": "xY9kL2m..."\n}\n\nShareable link: {url}#k={key}\nThe #k= hash is the decryption key (never sent to server).' },
            { title: t('apiUpdate'), code: 'PUT https://md2pdf.studio/api/update/{id}\nContent-Type: text/plain\nX-Edit-Key: {editKey}\nX-Enc-Key: {key}\n\n# Updated markdown\n\n---\nResponse 200:\n{ "id": "BrOrr0N3", "url": "https://md2pdf.studio/s/BrOrr0N3" }\n\nResponse 403: { "error": "Unauthorized" }\nResponse 404: { "error": "Document not found" }' },
            { title: t('apiCurl'), code: '# Create\ncurl -X POST https://md2pdf.studio/api/save \\\n  -H "Content-Type: text/plain" \\\n  -d "# Hello World"\n# Response: {"id":"abc","editKey":"...","url":"...","key":"xY9..."}\n# Share: {url}#k={key}\n\n# Update\ncurl -X PUT https://md2pdf.studio/api/update/BrOrr0N3 \\\n  -H "Content-Type: text/plain" \\\n  -H "X-Edit-Key: your-edit-key-here" \\\n  -H "X-Enc-Key: xY9kL2m..." \\\n  -d "# Updated content"' },
            { title: t('apiLimits'), code: 'Max document size: 500 KB\nRate limit: 10 requests/minute per IP\nExpiration: 90 days (resets on update)\nEncryption: AES-256-GCM (all documents)\nResponse: 429 Too Many Requests' },
        ];

        sections.forEach(function (s) {
            html += '<div class="api-section"><h4>' + s.title + '</h4><div class="api-code-block"><pre>' + escapeHtmlLight(s.code) + '</pre><button class="api-copy-btn">' + t('copy') + '</button></div></div>';
        });

        $('#tab-api').innerHTML = html;
        bindCopyButtons('#tab-api');
    }

    function escapeHtmlLight(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    function bindCopyButtons(containerSel) {
        document.querySelectorAll(containerSel + ' .api-copy-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var pre = btn.parentElement.querySelector('pre');
                navigator.clipboard.writeText(pre.textContent).then(function () {
                    btn.textContent = t('copied');
                    setTimeout(function () { btn.textContent = t('copy'); }, 2000);
                });
            });
        });
    }

    // ── Styles ───────────────────────────────────────

    const STYLES = {
        github: { name: 'GitHub', dark: false, bg: '#fff', css: '' },

        minimal: { name: 'Minimal', dark: false, bg: '#fff', css: `
.markdown-body {
  font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif !important;
  line-height: 1.85;
}
.markdown-body h1, .markdown-body h2 {
  border-bottom: none;
  font-weight: 600;
}
.markdown-body h1 { font-size: 2em; letter-spacing: -0.02em; }
.markdown-body blockquote {
  border-left-width: 3px;
  font-style: italic;
}
.markdown-body a { text-decoration: underline; text-underline-offset: 3px; }
.markdown-body hr { border: none; border-top: 1px solid var(--border, #e5e7eb); }
.markdown-body pre { border-radius: 8px; }
.md-toc { border: none; background: transparent; padding: 0; }
.md-toc a { font-family: 'Iowan Old Style', Georgia, serif; }
.code-block-wrapper { border: none; }
.code-block-header { background: transparent; border-bottom: 1px solid var(--border, #e5e7eb); }
`},

        academic: { name: 'Academic', dark: false, bg: '#fff', css: `
.markdown-body {
  font-family: Cambria, Georgia, 'Times New Roman', serif !important;
  font-size: 16px;
  line-height: 1.9;
  text-align: justify;
  hyphens: auto;
}
.markdown-body h1 {
  text-align: center;
  font-size: 1.7em;
  border-bottom: 2px solid currentColor;
  padding-bottom: 0.4em;
}
.markdown-body h2 {
  font-size: 1.4em;
  border-bottom: 1px solid currentColor;
  padding-bottom: 0.2em;
}
.markdown-body h3 { font-size: 1.15em; border-bottom: none; }
.markdown-body blockquote {
  font-style: italic;
  border-left-width: 4px;
}
.markdown-body pre { border-radius: 4px; }
.markdown-body table { font-size: 14px; }
.md-toc { border-radius: 2px; border-color: currentColor; }
.md-toc a { font-family: Cambria, Georgia, serif; }
.md-toc-title { text-transform: uppercase; letter-spacing: 0.1em; }
.code-block-wrapper { border-radius: 4px; }
.code-block-header { border-bottom-color: currentColor; }
.code-block-lang { font-family: Cambria, Georgia, serif; }
`},

        corporate: { name: 'Corporate', dark: false, bg: '#fff', css: `
.markdown-body {
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif !important;
  font-size: 15px;
  line-height: 1.7;
}
.markdown-body h1, .markdown-body h2, .markdown-body h3 { color: #2563eb; }
[data-theme="dark"] .markdown-body h1,
[data-theme="dark"] .markdown-body h2,
[data-theme="dark"] .markdown-body h3 { color: #60a5fa; }
.markdown-body h1 { border-bottom: 2px solid currentColor; }
.markdown-body h2 { border-bottom: 1px solid currentColor; }
.markdown-body h3 { border-bottom: none; }
.markdown-body blockquote {
  border-left: 4px solid #2563eb;
  border-radius: 0 8px 8px 0;
}
[data-theme="dark"] .markdown-body blockquote { border-left-color: #60a5fa; }
.markdown-body pre { border-radius: 8px; }
.markdown-body table th {
  background: #2563eb !important;
  color: #fff !important;
}
[data-theme="dark"] .markdown-body table th {
  background: #1e40af !important;
}
.md-toc { border-left: 4px solid #2563eb; border-radius: 0 8px 8px 0; }
[data-theme="dark"] .md-toc { border-left-color: #60a5fa; }
.md-toc-title { color: #2563eb; }
[data-theme="dark"] .md-toc-title { color: #60a5fa; }
.code-block-header { background: #2563eb0d; }
[data-theme="dark"] .code-block-header { background: #60a5fa0d; }
.code-block-lang { color: #2563eb; }
[data-theme="dark"] .code-block-lang { color: #60a5fa; }
`},

        notion: { name: 'Notion', dark: false, bg: '#fff', css: `
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
  font-size: 15px;
  line-height: 1.75;
}
.markdown-body h1 {
  font-size: 1.875em;
  border-bottom: none;
  font-weight: 700;
}
.markdown-body h2 {
  font-size: 1.5em;
  border-bottom: none;
  font-weight: 600;
  margin-top: 2em;
}
.markdown-body h3 {
  font-size: 1.25em;
  border-bottom: none;
}
.markdown-body code:not(pre code) {
  background: rgba(135,131,120,.15) !important;
  color: #eb5757 !important;
  border-radius: 4px;
  padding: 0.15em 0.4em;
  font-size: 0.88em;
}
[data-theme="dark"] .markdown-body code:not(pre code) {
  background: rgba(135,131,120,.3) !important;
  color: #ff7b72 !important;
}
.markdown-body pre { border-radius: 6px; border: none !important; }
.markdown-body blockquote { border-left: 3px solid currentColor; }
.markdown-body hr { border: none; border-top: 1px solid var(--border, #e5e7eb); }
.md-toc { border-radius: 8px; }
.md-toc a { color: var(--text-2); }
`},

        latex: { name: 'LaTeX', dark: false, bg: '#fff', css: `
@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Inconsolata:wght@400;500&display=swap');
.markdown-body {
  font-family: 'Libre Baskerville', 'Computer Modern', Georgia, serif !important;
  font-size: 15px;
  line-height: 1.9;
  text-align: justify;
  hyphens: auto;
  color: #1a1a1a !important;
}
[data-theme="dark"] .markdown-body { color: #e0ddd5 !important; }
.markdown-body h1 {
  text-align: center;
  font-size: 1.8em;
  border-bottom: none;
  font-weight: 700;
  margin-bottom: 0.2em;
}
.markdown-body h2 {
  font-size: 1.35em;
  border-bottom: none;
  font-weight: 700;
  margin-top: 2em;
}
.markdown-body h3 {
  font-size: 1.1em;
  border-bottom: none;
  font-style: italic;
  font-weight: 400;
}
.markdown-body code, .markdown-body pre code {
  font-family: 'Inconsolata', 'Courier New', monospace !important;
}
.markdown-body pre {
  border-radius: 2px;
  border: 1px solid #ccc !important;
}
[data-theme="dark"] .markdown-body pre { border-color: #444 !important; }
.markdown-body blockquote {
  border-left: 2px solid #666;
  font-style: italic;
  padding-left: 1.5em;
}
.markdown-body hr {
  border: none;
  text-align: center;
  margin: 2em 0;
}
.markdown-body hr::after {
  content: '* * *';
  color: #999;
  letter-spacing: 1em;
}
.markdown-body table {
  font-size: 14px;
}
.markdown-body table th {
  border-bottom: 2px solid currentColor !important;
  font-weight: 700;
}
.markdown-body a { color: inherit; text-decoration: underline; }
.md-toc { border: 1px solid #ccc; border-radius: 2px; background: transparent; }
[data-theme="dark"] .md-toc { border-color: #444; }
.md-toc a { font-family: 'Libre Baskerville', Georgia, serif; color: inherit; text-decoration: none; }
.md-toc a:hover { text-decoration: underline; }
.md-toc-title { font-family: 'Libre Baskerville', Georgia, serif; font-variant: small-caps; letter-spacing: 0.1em; }
.code-block-wrapper { border: 1px solid #ccc; border-radius: 2px; }
[data-theme="dark"] .code-block-wrapper { border-color: #444; }
.code-block-header { background: transparent; }
.code-block-lang { font-family: 'Inconsolata', monospace; }
`},

        dracula: { name: 'Dracula', dark: true, bg: '#282a36', css: `
.markdown-body {
  font-family: 'Segoe UI', system-ui, sans-serif !important;
  font-size: 15px;
  line-height: 1.75;
  color: #f8f8f2 !important;
  background: #282a36 !important;
}
.markdown-body h1, .markdown-body h2 {
  color: #bd93f9 !important;
  border-bottom: 1px solid #44475a;
}
.markdown-body h3, .markdown-body h4 { color: #ff79c6 !important; }
.markdown-body a { color: #8be9fd !important; }
.markdown-body strong { color: #ffb86c !important; }
.markdown-body em { color: #f1fa8c !important; }
.markdown-body code:not(pre code) {
  background: #44475a !important;
  color: #50fa7b !important;
  border-radius: 4px;
  padding: 0.15em 0.4em;
}
.markdown-body pre {
  background: #1e1f29 !important;
  border: 1px solid #44475a !important;
  border-radius: 8px;
}
.markdown-body blockquote {
  border-left: 4px solid #bd93f9;
  color: #ccc !important;
}
.markdown-body table th {
  background: #44475a !important;
  color: #f8f8f2 !important;
}
.markdown-body table td {
  background: #282a36 !important;
  color: #f8f8f2 !important;
  border-color: #44475a !important;
}
.markdown-body table tr {
  background: #282a36 !important;
  border-color: #44475a !important;
}
.markdown-body table tr:nth-child(2n) {
  background: #2e303e !important;
}
.markdown-body hr { border-color: #44475a !important; }
.markdown-body li::marker { color: #bd93f9; }
.md-toc { background: #1e1f29; border-color: #44475a; }
.md-toc-title { color: #ff79c6; }
.md-toc a { color: #f8f8f2; }
.md-toc a:hover { color: #8be9fd; }
.code-block-wrapper { border-color: #44475a; }
.code-block-header { background: #1e1f29; border-bottom-color: #44475a; }
.code-block-lang { color: #bd93f9; }
.code-copy-btn { color: #6272a4; }
.code-copy-btn:hover { color: #f8f8f2; border-color: #44475a; background: #44475a; }
`},

        newspaper: { name: 'Newspaper', dark: false, bg: '#fff', css: `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap');
.markdown-body {
  font-family: 'Source Serif 4', Georgia, serif !important;
  font-size: 15.5px;
  line-height: 1.8;
  text-align: justify;
  hyphens: auto;
}
.markdown-body h1 {
  font-family: 'Playfair Display', Georgia, serif !important;
  font-size: 2.4em;
  font-weight: 700;
  text-align: center;
  border-bottom: 3px double currentColor;
  padding-bottom: 0.3em;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.markdown-body h2 {
  font-family: 'Playfair Display', Georgia, serif !important;
  font-size: 1.5em;
  font-weight: 700;
  border-bottom: 1px solid currentColor;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 1.1em;
}
.markdown-body h3 {
  font-family: 'Playfair Display', Georgia, serif !important;
  font-style: italic;
  border-bottom: none;
  font-weight: 400;
  font-size: 1.2em;
}
.markdown-body blockquote {
  border-left: 3px solid currentColor;
  font-style: italic;
  font-size: 1.1em;
  padding: 0.5em 1em;
}
.markdown-body hr {
  border: none;
  border-top: 1px solid currentColor;
  margin: 2em auto;
  width: 40%;
}
.markdown-body a { color: inherit; text-decoration: underline; }
.markdown-body pre { border-radius: 0; border: 1px solid #999 !important; }
[data-theme="dark"] .markdown-body pre { border-color: #555 !important; }
.markdown-body table { font-size: 14px; }
.markdown-body table th {
  text-transform: uppercase;
  font-size: 0.85em;
  letter-spacing: 0.05em;
}
.md-toc { border: none; border-top: 1px solid currentColor; border-bottom: 1px solid currentColor; border-radius: 0; background: transparent; }
.md-toc a { font-family: 'Source Serif 4', Georgia, serif; }
.md-toc-title { font-family: 'Playfair Display', Georgia, serif; text-transform: uppercase; letter-spacing: 0.15em; font-size: 0.75em; }
.code-block-wrapper { border-radius: 0; border-color: #999; }
[data-theme="dark"] .code-block-wrapper { border-color: #555; }
.code-block-header { background: transparent; }
.code-block-lang { font-family: 'Source Serif 4', Georgia, serif; text-transform: none; font-style: italic; }
`},

        handwritten: { name: 'Handwritten', dark: false, bg: '#fff', css: `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap');
.markdown-body {
  font-family: 'Caveat', cursive !important;
  font-size: 20px;
  line-height: 1.9;
  background-image: repeating-linear-gradient(transparent, transparent 39px, #e8e4df 39px, #e8e4df 40px) !important;
  background-size: 100% 40px;
  padding-top: 8px !important;
}
[data-theme="dark"] .markdown-body {
  background-image: repeating-linear-gradient(transparent, transparent 39px, #2a2520 39px, #2a2520 40px) !important;
}
.markdown-body h1 {
  font-size: 2em;
  border-bottom: none;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-style: wavy;
  text-underline-offset: 6px;
}
.markdown-body h2 {
  font-size: 1.6em;
  border-bottom: none;
  font-weight: 700;
}
.markdown-body h3 {
  font-size: 1.3em;
  border-bottom: none;
  font-weight: 600;
}
.markdown-body code, .markdown-body pre code {
  font-family: 'Caveat', cursive !important;
  font-size: 0.9em;
}
.markdown-body pre {
  border-radius: 0;
  border: 2px dashed #bbb !important;
  background: rgba(0,0,0,0.02) !important;
}
[data-theme="dark"] .markdown-body pre {
  border-color: #555 !important;
  background: rgba(255,255,255,0.03) !important;
}
.markdown-body blockquote {
  border-left: 3px solid #e88;
  font-style: italic;
}
.markdown-body a { color: #4477cc; }
[data-theme="dark"] .markdown-body a { color: #6699ee; }
.markdown-body hr {
  border: none;
  border-top: 2px dashed #ccc;
}
[data-theme="dark"] .markdown-body hr { border-top-color: #444; }
.markdown-body table { font-size: 18px; }
.md-toc { border: 2px dashed #bbb; border-radius: 0; background: transparent; }
[data-theme="dark"] .md-toc { border-color: #555; }
.md-toc a { font-family: 'Caveat', cursive; font-size: 1.1em; }
.md-toc-title { font-family: 'Caveat', cursive; font-size: 1em; }
.code-block-wrapper { border: 2px dashed #bbb; border-radius: 0; }
[data-theme="dark"] .code-block-wrapper { border-color: #555; }
.code-block-header { background: transparent; border-bottom: 2px dashed #bbb; }
[data-theme="dark"] .code-block-header { border-bottom-color: #555; }
.code-block-lang { font-family: 'Caveat', cursive; font-size: 1em; text-transform: none; }
.code-copy-btn { font-family: 'Caveat', cursive; font-size: 1em; }
`},

        terminal: { name: 'Terminal', dark: true, bg: '#0a0a0a', css: `
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&display=swap');
.markdown-body {
  font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace !important;
  font-size: 14px;
  line-height: 1.7;
  color: #00ff41 !important;
  background: #0a0a0a !important;
}
.markdown-body h1, .markdown-body h2, .markdown-body h3 {
  color: #00ff41 !important;
  border-bottom: 1px solid #00ff4133;
  font-weight: 600;
}
.markdown-body h1::before { content: '# '; opacity: 0.4; }
.markdown-body h2::before { content: '## '; opacity: 0.4; }
.markdown-body h3::before { content: '### '; opacity: 0.4; }
.markdown-body a { color: #00bcd4 !important; }
.markdown-body strong { color: #ffeb3b !important; }
.markdown-body code:not(pre code) {
  background: #1a1a1a !important;
  color: #ff6b6b !important;
  border: 1px solid #333 !important;
  border-radius: 2px;
  padding: 0.1em 0.4em;
}
.markdown-body pre {
  background: #111 !important;
  border: 1px solid #333 !important;
  border-radius: 0;
}
.markdown-body blockquote {
  border-left: 3px solid #00ff41;
  color: #aaa !important;
}
.markdown-body table th {
  background: #1a1a1a !important;
  color: #00ff41 !important;
}
.markdown-body table td {
  background: #0a0a0a !important;
  color: #00ff41 !important;
  border-color: #333 !important;
}
.markdown-body table tr {
  background: #0a0a0a !important;
  border-color: #333 !important;
}
.markdown-body table tr:nth-child(2n) {
  background: #111 !important;
}
.markdown-body hr { border-color: #333 !important; }
.markdown-body li::marker { color: #00ff41; }
.md-toc { background: #111; border: 1px solid #333; border-radius: 0; }
.md-toc-title { color: #00ff41; font-family: 'Fira Code', monospace; }
.md-toc-title::before { content: '> '; }
.md-toc a { color: #00ff41; font-family: 'Fira Code', monospace; font-size: 0.85em; }
.md-toc a:hover { color: #00bcd4; }
.code-block-wrapper { border: 1px solid #333; border-radius: 0; }
.code-block-header { background: #111; border-bottom-color: #333; }
.code-block-lang { color: #00ff41; font-family: 'Fira Code', monospace; }
.code-copy-btn { color: #00ff41; font-family: 'Fira Code', monospace; }
.code-copy-btn:hover { color: #00bcd4; background: #1a1a1a; border-color: #333; }
`},

        pastel: { name: 'Pastel', dark: false, bg: '#fff', css: `
@import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;1,400&display=swap');
.markdown-body {
  font-family: 'Nunito', 'Rounded Mplus 1c', system-ui, sans-serif !important;
  font-size: 15px;
  line-height: 1.8;
}
.markdown-body h1 {
  color: #e879a8 !important;
  border-bottom: 2px solid #f0c4d8;
  font-weight: 700;
  font-size: 2em;
}
[data-theme="dark"] .markdown-body h1 {
  border-bottom-color: #5a3045;
}
.markdown-body h2 {
  color: #7c6dd8 !important;
  border-bottom: 1px solid #c4bef0;
  font-weight: 700;
}
[data-theme="dark"] .markdown-body h2 { border-bottom-color: #3d3570; }
.markdown-body h3 {
  color: #4db8a8 !important;
  border-bottom: none;
  font-weight: 700;
}
.markdown-body a { color: #6ba3e8 !important; }
.markdown-body code:not(pre code) {
  background: #fce4ec !important;
  color: #c0456e !important;
  border-radius: 12px;
  padding: 0.15em 0.5em;
  font-size: 0.88em;
}
[data-theme="dark"] .markdown-body code:not(pre code) {
  background: #3d1a28 !important;
  color: #f48fb1 !important;
}
.markdown-body pre {
  border-radius: 16px;
  border: 2px solid #e8d4f0 !important;
}
[data-theme="dark"] .markdown-body pre {
  border-color: #3d2850 !important;
}
.markdown-body blockquote {
  border-left: 4px solid #b8a9e8;
  border-radius: 0 12px 12px 0;
  background: rgba(184,169,232,0.08);
  padding: 0.8em 1em;
}
[data-theme="dark"] .markdown-body blockquote {
  background: rgba(184,169,232,0.05);
}
.markdown-body table th {
  background: #e8d4f0 !important;
  color: #5a3878 !important;
  border-radius: 0;
}
[data-theme="dark"] .markdown-body table th {
  background: #3d2850 !important;
  color: #d4b8e8 !important;
}
.markdown-body hr {
  border: none;
  height: 2px;
  background: linear-gradient(90deg, #f0c4d8, #c4bef0, #a8e0d8);
}
.markdown-body img { border-radius: 12px; }
.md-toc { border: 2px solid #e8d4f0; border-radius: 16px; background: rgba(184,169,232,0.05); }
[data-theme="dark"] .md-toc { border-color: #3d2850; }
.md-toc-title { color: #e879a8; }
.md-toc a { color: #7c6dd8; font-family: 'Nunito', sans-serif; }
.md-toc a:hover { color: #e879a8; }
.code-block-wrapper { border: 2px solid #e8d4f0; border-radius: 16px; }
[data-theme="dark"] .code-block-wrapper { border-color: #3d2850; }
.code-block-header { background: rgba(184,169,232,0.05); border-bottom-color: #e8d4f0; }
[data-theme="dark"] .code-block-header { border-bottom-color: #3d2850; }
.code-block-lang { color: #7c6dd8; font-family: 'Nunito', sans-serif; }
.code-copy-btn { font-family: 'Nunito', sans-serif; }
.code-copy-btn:hover { color: #e879a8; }
`},
    };

    // ── Templates ────────────────────────────────────

    const TEMPLATES = {
        blank: '',

        cv: `# Your Name

**Full Stack Developer** | City, Country
your@email.com | [LinkedIn](https://linkedin.com/in/yourprofile) | [GitHub](https://github.com/youruser)

---

## Experience

### Senior Developer — Company Name
*Jan 2024 – Present*

- Led development of the main platform serving 50k+ users
- Implemented CI/CD pipelines reducing deploy time by 60%
- Mentored a team of 4 junior developers

### Developer — Previous Company
*Mar 2021 – Dec 2023*

- Built RESTful APIs with Node.js and PostgreSQL
- Developed responsive interfaces with React and Tailwind CSS
- Optimized database queries improving response time by 40%

---

## Education

### University Name
**Bachelor in Computer Science** — 2017–2021

---

## Skills

| Category | Technologies |
|----------|-------------|
| Frontend | React, TypeScript, Next.js, Tailwind CSS |
| Backend  | Node.js, Python, Django, Express |
| Database | PostgreSQL, MongoDB, Redis |
| DevOps   | Docker, AWS, GitHub Actions |

---

## Languages

- Spanish — Native
- English — Professional proficiency
`,

        report: `# Monthly Report — April 2026

**Author:** Your Name
**Department:** Engineering
**Date:** April 8, 2026

---

## Executive Summary

Brief overview of the month's progress, key achievements, and challenges encountered.

## Key Metrics

| Metric | Previous | Current | Change |
|--------|----------|---------|--------|
| Active Users | 12,500 | 14,800 | +18.4% |
| Uptime | 99.2% | 99.8% | +0.6% |
| Avg Response | 245ms | 180ms | -26.5% |
| Tickets Resolved | 89 | 112 | +25.8% |

## Highlights

- Successfully launched the new dashboard feature
- Migrated database to new cluster with zero downtime
- Reduced infrastructure costs by 15%

## Challenges

- Third-party API rate limits affected data sync
- Need additional resources for Q2 roadmap

## Action Items

- [ ] Finalize Q2 roadmap by April 15
- [ ] Schedule performance review meetings
- [ ] Complete security audit for new modules

## Next Month Goals

1. Launch mobile app beta
2. Implement automated testing pipeline
3. Onboard 2 new team members
`,

        docs: `# Project Name

> A brief description of what this project does and who it's for.

## Installation

\`\`\`bash
npm install project-name
\`\`\`

## Quick Start

\`\`\`javascript
import { createApp } from 'project-name';

const app = createApp({
  port: 3000,
  debug: true,
});

app.start();
\`\`\`

## API Reference

### \`createApp(options)\`

Creates a new application instance.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| \`port\` | \`number\` | \`3000\` | Server port |
| \`debug\` | \`boolean\` | \`false\` | Enable debug mode |
| \`env\` | \`string\` | \`"production"\` | Environment name |

**Returns:** \`App\` instance

### \`app.start()\`

Starts the application server.

\`\`\`javascript
await app.start();
console.log('Server running');
\`\`\`

## Configuration

Create a \`config.json\` file in the root directory:

\`\`\`json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "myapp"
  }
}
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing\`)
5. Open a Pull Request

## License

MIT
`,

        changelog: `# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0] — 2026-04-08

### Added
- Dark mode support across all components
- Export to PDF functionality
- Drag and drop file upload

### Changed
- Improved table rendering performance
- Updated dependencies to latest versions

### Fixed
- Fixed scroll position reset on theme toggle
- Resolved memory leak in preview renderer

---

## [2.0.0] — 2026-03-15

### Added
- Complete UI redesign with new design system
- Multi-language support (EN, ES)
- Keyboard shortcuts

### Changed
- **BREAKING:** Renamed \`config.init()\` to \`config.setup()\`
- Migrated from Webpack to Vite

### Removed
- Removed deprecated \`legacy\` mode
- Dropped support for IE11

---

## [1.5.2] — 2026-02-28

### Fixed
- Fixed crash when opening empty files
- Corrected date formatting in reports

---

## [1.5.0] — 2026-02-10

### Added
- Auto-save feature
- Template gallery

### Changed
- Improved search performance by 3x
`,

        meeting: `# Meeting Notes — April 8, 2026

**Project:** Project Name
**Attendees:** Alice, Bob, Carol, Dave
**Duration:** 45 minutes
**Facilitator:** Alice

---

## Agenda

1. Sprint review & demo
2. Deployment timeline
3. Open issues
4. Next steps

## Discussion

### 1. Sprint Review

- Completed 14 out of 16 story points
- Demo of the new dashboard was well received
- Two items moved to next sprint due to dependency blockers

### 2. Deployment Timeline

- Staging deploy scheduled for **April 10**
- Production release targeted for **April 14** pending QA signoff
- Rollback plan documented in Confluence

### 3. Open Issues

- API rate limiting needs investigation — assigned to Bob
- CSS rendering issue on Safari — assigned to Carol
- Documentation needs updating for v2.1 — assigned to Dave

## Decisions

- Agreed to adopt bi-weekly release cadence starting May
- Will use feature flags for gradual rollout

## Action Items

- [ ] **Bob** — Investigate API rate limiting (Due: Apr 10)
- [ ] **Carol** — Fix Safari rendering bug (Due: Apr 11)
- [ ] **Dave** — Update v2.1 documentation (Due: Apr 12)
- [ ] **Alice** — Send stakeholder update email (Due: Apr 9)

## Next Meeting

**April 15, 2026** at 10:00 AM
`,
    };

    // ── Default sample ───────────────────────────────

    const SAMPLE = `# Welcome to MD2PDF

> Free, open-source Markdown to PDF converter — runs in your browser, no signup required.

[TOC title="Table of Contents"]

---

## Features

| Feature | Description |
|---|---|
| **Live Preview** | See changes in real time as you type |
| **11 Visual Styles** | Notion, GitHub, LaTeX, Dracula, Terminal & more |
| **Mermaid Diagrams** | Flowcharts, sequences, Gantt charts, and more |
| **PDF / HTML / Image** | Export in any format with one click |
| **Encryption at Rest** | Shared documents stored encrypted with AES-256-GCM |
| **AI Skill** | Installable skill for Claude, ChatGPT, Gemini |
| **Custom CSS** | Full control over the output styling |
| **Auto Table of Contents** | Write \`[TOC]\` or \`[TOC title="..."]\` to generate one |

---

## Code Highlighting

Syntax highlighting for **180+ languages** with copy button on every block.

\`\`\`typescript
interface Document {
  id: string;
  content: string;
  style: "notion" | "github" | "latex" | "dracula";
  encrypted: boolean;
}

async function createDocument(md: string): Promise<Document> {
  const res = await fetch("https://md2pdf.studio/api/save", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: md,
  });
  return res.json();
}
\`\`\`

\`\`\`python
from dataclasses import dataclass

@dataclass
class Style:
    name: str
    dark: bool
    font: str

styles = [
    Style("Notion", False, "system-ui"),
    Style("Dracula", True, "system-ui"),
    Style("Terminal", True, "Fira Code"),
    Style("LaTeX", False, "Libre Baskerville"),
]

for s in styles:
    print(f"{s.name}: {'dark' if s.dark else 'light'} theme")
\`\`\`

---

## Mermaid Diagrams

Write diagrams as code — they render automatically.

### Flowchart

\`\`\`mermaid
graph TD
    A[Write Markdown] --> B{Choose Style}
    B --> C[Notion]
    B --> D[GitHub]
    B --> E[LaTeX]
    B --> F[Dracula]
    C & D & E & F --> G[Export]
    G --> H[PDF]
    G --> I[HTML]
    G --> J[Image]
\`\`\`

### Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Browser
    participant API
    participant KV

    User->>Browser: Write Markdown
    Browser->>API: POST /api/save
    API->>API: Encrypt (AES-256-GCM)
    API->>KV: Store ciphertext
    API-->>Browser: { url, key }
    Browser-->>User: Share link with #k=key
\`\`\`

---

## Blockquote & Formatting

> **Tip:** Write \`[TOC]\` for a clean list, or \`[TOC title="Table of Contents"]\` to add a heading.

Text formatting: **bold**, *italic*, ~~strikethrough~~, \`inline code\`, and [links](https://md2pdf.studio).

---

## Task List

- [x] Live preview with split/preview modes
- [x] 11 visual styles with custom CSS
- [x] Syntax highlighting for 180+ languages
- [x] Mermaid diagrams (flowchart, sequence, Gantt...)
- [x] Auto table of contents with \`[TOC]\` or \`[TOC title="..."]\`
- [x] Encrypted-at-rest sharing
- [x] AI Skill for Claude, ChatGPT, Gemini
- [ ] Your next document starts here

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| \`Ctrl + S\` | Export to PDF (continuous) |
| \`Ctrl + F\` | Find in editor |
| \`Ctrl + H\` | Find & replace |
| \`Ctrl + Shift + L\` | Toggle dark/light theme |

---

*Start writing on the left, or drag and drop a \`.md\` file.*
`;

    // ── Markdown setup ───────────────────────────────

    let _mermaidId = 0;

    function initMarked() {
        marked.setOptions({ breaks: true, gfm: true });

        // Custom renderer: add id anchors to headings for TOC links
        try {
            const renderer = new marked.Renderer();
            renderer.heading = function (token) {
                var text = typeof token === 'object' ? token.text : arguments[0];
                var depth = typeof token === 'object' ? token.depth : arguments[1];
                var raw = text.replace(/<[^>]+>/g, '');
                var slug = raw.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                return '<h' + depth + ' id="' + slug + '">' + text + '</h' + depth + '>\n';
            };
            marked.use({ renderer: renderer });
        } catch (_) {}

        // Mermaid init (non-blocking — app works without it)
        try {
            if (typeof mermaid !== 'undefined') {
                mermaid.initialize({
                    startOnLoad: false,
                    theme: getTheme() === 'dark' ? 'dark' : 'default',
                    securityLevel: 'loose',
                });
            }
        } catch (_) {}
    }

    // ── Render ───────────────────────────────────────

    const TOC_PLACEHOLDER = '\u00ABTOC_PLACEHOLDER\u00BB';

    // Rebuilt wholesale on every call. Names come from user input, so they are
    // set through textContent — never interpolated into HTML. The list always
    // renders, even with a single document, so the "+" entry point stays reachable.
    // Each row also carries an initial used by the collapsed rail.
    function docInitial(name) {
        const m = String(name || '').trim().match(/[A-Za-zÀ-ɏ一-鿿0-9]/);
        return m ? m[0].toUpperCase() : '?';
    }

    function renderTabs() {
        const list = document.getElementById('docTabs');
        if (!list) return;
        list.innerHTML = '';
        const frag = document.createDocumentFragment();
        docs.forEach(d => {
            const tab = document.createElement('div');
            tab.className = 'doc-tab' + (d.id === activeDocId ? ' active' : '');
            tab.dataset.docId = String(d.id);
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-selected', d.id === activeDocId ? 'true' : 'false');
            tab.title = d.name;

            const initial = document.createElement('span');
            initial.className = 'doc-tab-initial';
            initial.textContent = docInitial(d.name);
            initial.setAttribute('aria-hidden', 'true');
            tab.appendChild(initial);

            const name = document.createElement('span');
            name.className = 'doc-tab-name';
            name.textContent = d.name;
            tab.appendChild(name);

            const close = document.createElement('button');
            close.type = 'button';
            close.className = 'doc-tab-close';
            close.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';
            close.setAttribute('aria-label', t('closeTab') + ': ' + d.name);
            tab.appendChild(close);

            frag.appendChild(tab);
        });
        list.appendChild(frag);
    }

    function setSidebarCollapsed(collapsed) {
        const side = document.getElementById('docSidebar');
        if (!side) return;
        side.classList.toggle('collapsed', !!collapsed);
        const toggle = document.getElementById('docSidebarToggle');
        if (toggle) {
            toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
            toggle.title = collapsed ? t('expandSidebar') : t('collapseSidebar');
            toggle.setAttribute('aria-label', toggle.title);
        }
        localStorage.setItem('md2pdf-sidebar-collapsed', collapsed ? '1' : '0');
    }

    // Removes the tab from the session. Persisted content of the closed doc is
    // dropped too — the store only ever mirrors the live docs array.
    function closeDoc(id) {
        if (docs.length <= 1) return;
        const index = docs.findIndex(d => d.id === id);
        if (index === -1) return;

        const wasActive = docs[index].id === activeDocId;
        if (wasActive) captureActive();
        docs.splice(index, 1);

        if (wasActive) {
            const next = docs[Math.min(index, docs.length - 1)];
            activateDoc(next.id);
        } else {
            renderTabs();
            saveDraft();
        }
    }

    function render() {
        clearTimeout(renderTimer);
        renderTimer = null;
        renderGeneration++;
        renderError = null;
        renderPromise = Promise.resolve();
        try {
            const src = editor.value.trim();
            if (!src) {
                preview.innerHTML = '<div class="preview-empty"><p>Start typing to see the preview...</p></div>';
            } else {
                // Replace [TOC] / [TOC title="..."] before marked parses it.
                const processed = src.replace(/^\[toc(?:\s+title="([^"]*)")?\]$/gim, function (_, title) {
                    return title ? TOC_PLACEHOLDER + ':' + title : TOC_PLACEHOLDER;
                });
                preview.innerHTML = marked.parse(processed);
                injectTOC();
                preview.querySelectorAll('pre code').forEach(block => {
                    if (block.classList.contains('language-mermaid')) return;
                    hljs.highlightElement(block);
                });
                renderPromise = renderMermaidBlocks();
                addCodeCopyButtons();
            }
            updateCounter();
        } catch (err) {
            renderError = err;
            throw err;
        }
        return renderPromise;
    }

    function injectTOC() {
        const html = preview.innerHTML;
        if (!html.includes(TOC_PLACEHOLDER)) return;

        // H2–H6 only — H1 is the document title, not a section
        const headings = preview.querySelectorAll('h2, h3, h4, h5, h6');

        // Match placeholder with optional title: «TOC_PLACEHOLDER»:My Title or just «TOC_PLACEHOLDER»
        const tocRegex = new RegExp('<p>' + TOC_PLACEHOLDER + '(?::([^<]*))?</p>|' + TOC_PLACEHOLDER + '(?::([^<]*))?', 'g');

        if (!headings.length) {
            preview.innerHTML = html.replace(tocRegex, '');
            return;
        }

        preview.innerHTML = html.replace(tocRegex, function (_, t1, t2) {
            const title = t1 || t2 || '';
            let toc = '<nav class="md-toc">';
            if (title) toc += '<p class="md-toc-title">' + title + '</p>';
            toc += '<ul>';
            headings.forEach(h => {
                const level = parseInt(h.tagName[1]);
                toc += '<li class="md-toc-h' + level + '"><a href="#' + h.id + '">' + h.textContent + '</a></li>';
            });
            toc += '</ul></nav>';
            return toc;
        });

        // Intercept TOC clicks — scroll inside the preview container, not the page
        preview.querySelectorAll('.md-toc a').forEach(a => {
            a.addEventListener('click', function (e) {
                e.preventDefault();
                const id = this.getAttribute('href').slice(1);
                const target = document.getElementById(id);
                if (target) {
                    previewContainer.scrollTo({ top: target.offsetTop - previewContainer.offsetTop, behavior: 'smooth' });
                }
            });
        });
    }

    // Per-style mermaid theme variables
    const MERMAID_THEMES = {
        github:     { theme: 'default' },
        notion:     { theme: 'default', themeVariables: { primaryColor: '#e8e8e8', primaryTextColor: '#1f2328', lineColor: '#656d76', secondaryColor: '#f6f8fa' } },
        minimal:    { theme: 'default', themeVariables: { primaryColor: '#f0ece4', primaryTextColor: '#333', lineColor: '#999', secondaryColor: '#faf8f4', fontFamily: 'Georgia, serif' } },
        academic:   { theme: 'default', themeVariables: { primaryColor: '#e8e4dc', primaryTextColor: '#1a1a1a', lineColor: '#666', secondaryColor: '#f5f3ef', fontFamily: 'Cambria, Georgia, serif' } },
        corporate:  { theme: 'default', themeVariables: { primaryColor: '#dbeafe', primaryTextColor: '#1e3a5f', lineColor: '#2563eb', secondaryColor: '#eff6ff', tertiaryColor: '#f0f7ff' } },
        latex:      { theme: 'default', themeVariables: { primaryColor: '#e8e4d8', primaryTextColor: '#1a1a1a', lineColor: '#666', secondaryColor: '#f5f3ed', fontFamily: "'Libre Baskerville', Georgia, serif" } },
        dracula:    { theme: 'dark',    themeVariables: { primaryColor: '#44475a', primaryTextColor: '#f8f8f2', lineColor: '#6272a4', secondaryColor: '#3c3f58', tertiaryColor: '#282a36', primaryBorderColor: '#6272a4' } },
        newspaper:  { theme: 'default', themeVariables: { primaryColor: '#e8e4dc', primaryTextColor: '#1a1a1a', lineColor: '#555', secondaryColor: '#f5f3ef', fontFamily: "'Source Serif 4', Georgia, serif" } },
        handwritten:{ theme: 'default', themeVariables: { primaryColor: '#fce4ec', primaryTextColor: '#333', lineColor: '#e88', secondaryColor: '#fff5f5', fontFamily: "'Caveat', cursive" } },
        terminal:   { theme: 'dark',    themeVariables: { primaryColor: '#1a1a1a', primaryTextColor: '#00ff41', lineColor: '#00ff41', secondaryColor: '#111', tertiaryColor: '#0a0a0a', primaryBorderColor: '#333', fontFamily: "'Fira Code', monospace" } },
        pastel:     { theme: 'default', themeVariables: { primaryColor: '#f0d4f8', primaryTextColor: '#5a3878', lineColor: '#b8a9e8', secondaryColor: '#fce4ec', tertiaryColor: '#e0f4f0' } },
    };

    function renderMermaidBlocks() {
        if (typeof mermaid === 'undefined') return Promise.resolve();
        const blocks = preview.querySelectorAll('pre code.language-mermaid');
        if (!blocks.length) return Promise.resolve();

        var mermaidCfg = MERMAID_THEMES[currentStyle] || MERMAID_THEMES.github;
        var isDark = STYLES[currentStyle]?.dark || getTheme() === 'dark';
        mermaid.initialize({
            startOnLoad: false,
            theme: mermaidCfg.theme || (isDark ? 'dark' : 'default'),
            themeVariables: mermaidCfg.themeVariables || {},
            securityLevel: 'loose',
        });

        const isMermaidDark = mermaidCfg.theme === 'dark';

        const tasks = Array.from(blocks).map(code => {
            const pre = code.parentElement;
            // Skip if already inside a wrapper (re-render guard)
            if (pre.closest('.mermaid-block')) return Promise.resolve();
            const diagram = code.textContent;
            const id = 'mermaid-' + (++_mermaidId);
            const container = document.createElement('div');
            container.className = 'mermaid-block ' + (isMermaidDark ? 'mermaid-block-dark' : 'mermaid-block-light');
            pre.parentNode.replaceChild(container, pre);
            return Promise.resolve().then(() => mermaid.render(id, diagram)).then(function (result) {
                container.innerHTML = result.svg;
            }).catch(function () {
                container.innerHTML = '<pre class="mermaid-error">Invalid Mermaid diagram</pre>';
            });
        });
        return Promise.all(tasks).then(() => undefined);
    }

    function addCodeCopyButtons() {
        preview.querySelectorAll('pre').forEach(pre => {
            if (pre.querySelector('.code-copy-btn')) return;
            const wrapper = document.createElement('div');
            wrapper.className = 'code-block-wrapper';
            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);

            const code = pre.querySelector('code');
            const lang = code ? (code.className.match(/language-(\S+)/) || [])[1] || '' : '';

            const header = document.createElement('div');
            header.className = 'code-block-header';
            header.innerHTML =
                '<span class="code-block-lang">' + (lang ? lang : '') + '</span>' +
                '<button class="code-copy-btn" type="button" aria-label="' + t('copy') + '">' +
                    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                        '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>' +
                        '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>' +
                    '</svg>' +
                    '<span class="code-copy-label">' + t('copy') + '</span>' +
                '</button>';
            wrapper.insertBefore(header, pre);

            header.querySelector('.code-copy-btn').addEventListener('click', function () {
                const text = pre.textContent;
                navigator.clipboard.writeText(text).then(() => {
                    const label = this.querySelector('.code-copy-label');
                    const svg = this.querySelector('svg');
                    label.textContent = t('copied');
                    svg.innerHTML = '<polyline points="20 6 9 17 4 12"/>';
                    this.classList.add('copied');
                    setTimeout(() => {
                        label.textContent = t('copy');
                        svg.innerHTML = '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>';
                        this.classList.remove('copied');
                    }, 2000);
                });
            });
        });
    }

    function scheduleRender() {
        clearTimeout(renderTimer);
        renderTimer = setTimeout(() => {
            renderTimer = null;
            render();
        }, 100);
        syncFromEditor();
        saveDraft();
    }

    // ── Counter ──────────────────────────────────────

    function updateCounter() {
        const text = editor.value.trim();
        if (!text) { counterEl.textContent = `0 ${t('words')}`; return; }
        const words = text.split(/\s+/).filter(Boolean).length;
        const mins  = Math.max(1, Math.ceil(words / 200));
        counterEl.textContent = `${words} ${t('words')} · ~${mins} ${t('minRead')}`;
    }

    // ── Theme ────────────────────────────────────────

    function getTheme() {
        return localStorage.getItem('md2pdf-theme') ||
            (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    }

    function applyTheme(t) {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('md2pdf-theme', t);

        const forceDark = STYLES[currentStyle]?.dark;

        $('#md-css-dark').disabled    = forceDark ? false : t !== 'dark';
        $('#md-css-light').disabled   = forceDark ? true  : t !== 'light';
        $('#hljs-css-dark').disabled  = forceDark ? false : t !== 'dark';
        $('#hljs-css-light').disabled = forceDark ? true  : t !== 'light';

        // Update mermaid theme
        try {
            if (typeof mermaid !== 'undefined') {
                const forceDarkMermaid = forceDark || t === 'dark';
                mermaid.initialize({ startOnLoad: false, theme: forceDarkMermaid ? 'dark' : 'default', securityLevel: 'loose' });
            }
        } catch (_) {}

        // Force repaint on editor and preview to pick up new CSS variables
        const bg = forceDark ? STYLES[currentStyle].bg : (t === 'dark' ? '#0d1117' : '#ffffff');
        editor.style.background = bg;
        previewContainer.style.background = bg;
        requestAnimationFrame(() => {
            editor.style.background = '';
            previewContainer.style.background = '';
        });

        render();
    }

    function toggleTheme() {
        applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
    }

    // ── Styles ───────────────────────────────────────

    function applyStyle(key, opts) {
        currentStyle = key;
        styleSelect.value = key;
        styleOverride.textContent = STYLES[key]?.css || '';
        // md2pdf-style only records the last-used style (the default for a new
        // doc). Tab switches must not overwrite it.
        if (!opts || opts.persist !== false) localStorage.setItem('md2pdf-style', key);

        // Re-apply theme CSS to toggle dark/light base for the preview
        applyTheme(getTheme());
    }

    // ── Custom CSS ───────────────────────────────────

    function applyCustomCSS(showFeedback) {
        // Boost specificity: wrap user CSS so it always wins over style overrides
        var raw = customCSSInput.value;
        customOverride.textContent = raw ? ('\n/* Custom CSS */\n' + raw + '\n') : '';
        localStorage.setItem('md2pdf-custom-css', raw);
        if (showFeedback) showToast(currentLang === 'es' ? 'CSS aplicado' : 'CSS applied');
    }

    // ── Templates ────────────────────────────────────

    function loadTemplate(key) {
        const tpl = TEMPLATES[key];
        if (tpl === undefined) return;
        createDocAndActivate({
            name: key === 'blank' ? 'untitled.md' : `${key}.md`,
            content: tpl,
        });
        showToast(key === 'blank' ? t('newDocument') : t('templateLoaded'));
    }

    // ── File handling ────────────────────────────────

    function loadFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            createDocAndActivate({ name: file.name, content: e.target.result, dedup: true });
        };
        reader.readAsText(file);
    }

    function initDragDrop() {
        let counter = 0;
        document.addEventListener('dragenter', (e) => { e.preventDefault(); if (++counter === 1) dropOverlay.classList.add('active'); });
        document.addEventListener('dragleave', (e) => { e.preventDefault(); if (--counter === 0) dropOverlay.classList.remove('active'); });
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => {
            e.preventDefault(); counter = 0; dropOverlay.classList.remove('active');
            const f = e.dataTransfer.files[0];
            if (f) loadFile(f);
        });
    }

    // ── Doc store ─────────────────────────────────────

    function activeDoc() {
        return docs.find(d => d.id === activeDocId) || null;
    }

    // Monotonic id generator. Non-empty content maps onto an existing tab when
    // there already is one, so re-dropping a file or re-opening a template
    // focuses that document instead of duplicating it. Blank documents and
    // explicit copies (dedup: false) always get their own tab.
    function newDocId(content, dedup) {
        if (dedup !== false && typeof content === 'string' && content !== '') {
            const dup = docs.find(d => d.content === content);
            if (dup) return dup.id;
        }
        return _nextDocId++;
    }

    function scrollRatio() {
        const max = editor.scrollHeight - editor.clientHeight;
        return max > 0 ? editor.scrollTop / max : 0;
    }

    // Flush the editor into the active doc before anything reads the doc.
    function captureActive() {
        const d = activeDoc();
        if (!d) return;
        d.content = editor.value;
        d.name = currentFileName;
        d.style = currentStyle;
        d.selStart = editor.selectionStart;
        d.selEnd = editor.selectionEnd;
        d.scrollRatio = scrollRatio();
    }

    // Keep the in-memory doc in step with typing without a full capture.
    function syncFromEditor() {
        const d = activeDoc();
        if (d) d.content = editor.value;
    }

    // preview-only / shared-locked travel with the doc: the workspace layout is
    // not global state, it belongs to whichever tab is active.
    function applySharedLock(shared) {
        isSharedView = !!shared;
        workspace.classList.toggle('shared-locked', isSharedView);
        workspace.classList.toggle('preview-only', isSharedView);
        const lockBtn = document.getElementById('sharedLock');
        if (lockBtn) {
            lockBtn.hidden = !isSharedView;
            if (isSharedView) { lockBtn.title = t('sharedLockTip'); lockBtn.setAttribute('aria-label', t('sharedLockTip')); }
        }
        viewToggle.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        const target = viewToggle.querySelector(isSharedView ? '[data-view="preview"]' : '[data-view="split"]');
        if (target) target.classList.add('active');
    }

    function activateDoc(id, opts) {
        const restoreView = !opts || opts.restoreView !== false;
        const d = docs.find(doc => doc.id === id);
        if (!d || d.id === activeDocId) { if (d) renderTabs(); return; }

        captureActive();
        activeDocId = d.id;
        currentFileName = d.name;
        editor.value = d.content;
        fileNameEl.value = d.name;
        applySharedLock(d.shared);

        // Find matches are offsets into the previous document — drop them
        // without closeFind(), which would steal focus into the editor.
        findPanel.classList.remove('open');
        replaceRow.classList.remove('open');
        findMatches = [];
        findIdx = -1;
        findCount.textContent = '';

        const wantStyle = opts && opts.style;
        if (wantStyle && STYLES[wantStyle] && wantStyle !== currentStyle) {
            applyStyle(wantStyle);
        } else if (d.style !== currentStyle) {
            // applyStyle → applyTheme → render() closes this branch.
            applyStyle(d.style, { persist: false });
        } else {
            currentStyle = d.style;
            styleSelect.value = d.style;
            styleOverride.textContent = STYLES[d.style]?.css || '';
            render();
        }

        if (restoreView) {
            requestAnimationFrame(() => {
                try {
                    editor.setSelectionRange(d.selStart || 0, d.selEnd || 0);
                    const max = editor.scrollHeight - editor.clientHeight;
                    if (max > 0 && d.scrollRatio) editor.scrollTop = d.scrollRatio * max;
                } catch (_) {}
            });
        }
        renderTabs();
        saveDraft();
    }

    function createDocAndActivate(opts) {
        const content = opts.content != null ? opts.content : '';
        const id = newDocId(content, opts.dedup);
        const existing = docs.find(d => d.id === id);
        if (existing) { activateDoc(existing.id); return existing; }

        const d = {
            id,
            name: opts.name || 'untitled.md',
            content,
            style: opts.style || currentStyle,
            selStart: 0,
            selEnd: 0,
            scrollRatio: 0,
            shared: !!opts.shared,
        };
        docs.push(d);
        activateDoc(d.id, { style: opts.style });
        return d;
    }

    // ── localStorage ─────────────────────────────────

    const DOCS_KEY = 'md2pdf-docs';
    const DOC_VIEW_KEY = 'md2pdf-doc-view';

    function saveDraft() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            captureActive();
            const d = activeDoc();
            if (!d) return;                    // detached editor — nothing to persist
            const list = docs.map(doc => ({
                id: doc.id, name: doc.name, content: doc.content, style: doc.style, shared: !!doc.shared,
            }));
            const view = {};
            docs.forEach(doc => {
                view[doc.id] = { selStart: doc.selStart || 0, selEnd: doc.selEnd || 0, scrollRatio: doc.scrollRatio || 0 };
            });
            const payload = JSON.stringify({ activeId: activeDocId, list });
            if (payload.length > 4 * 1024 * 1024) { showToast(t('storageFull')); return; }
            try {
                localStorage.setItem(DOCS_KEY, payload);
                localStorage.setItem(DOC_VIEW_KEY, JSON.stringify(view));
            } catch (_) {
                // Quota exceeded — keep editing, just tell the user it won't persist.
                showToast(t('storageFull'));
            }
        }, 800);
    }

    // Loads a doc into the editor without a tab switch (used during boot).
    function loadDocInto(d) {
        activeDocId = d.id;
        currentFileName = d.name;
        editor.value = d.content;
        fileNameEl.value = d.name;
        applySharedLock(d.shared);
        if (d.style !== currentStyle) applyStyle(d.style, { persist: false });
    }

    function restoreDocs() {
        const raw = localStorage.getItem(DOCS_KEY);
        if (raw) {
            try {
                const saved = JSON.parse(raw);
                if (Array.isArray(saved.list) && saved.list.length) {
                    saved.list.forEach(item => {
                        docs.push({
                            id: item.id,
                            name: item.name || 'untitled.md',
                            content: item.content || '',
                            style: item.style || currentStyle,
                            selStart: 0, selEnd: 0, scrollRatio: 0,
                            shared: !!item.shared,
                        });
                    });
                    _nextDocId = docs.reduce((m, doc) => Math.max(m, doc.id + 1), 1);

                    const view = (() => {
                        try { return JSON.parse(localStorage.getItem(DOC_VIEW_KEY) || '{}'); } catch (_) { return {}; }
                    })();
                    docs.forEach(doc => {
                        const v = view[doc.id];
                        if (v) {
                            doc.selStart = v.selStart || 0;
                            doc.selEnd = v.selEnd || 0;
                            doc.scrollRatio = v.scrollRatio || 0;
                        }
                    });

                    loadDocInto(docs.find(doc => doc.id === saved.activeId) || docs[0]);
                    return true;
                }
            } catch (_) {}
        }

        // One-off migration from the single-slot keys. The legacy keys are left
        // in place so a rollback still finds its draft.
        const draft = localStorage.getItem('md2pdf-draft');
        if (draft !== null && draft !== '') {
            docs.push({
                id: _nextDocId++,
                name: localStorage.getItem('md2pdf-filename') || 'untitled.md',
                content: draft,
                style: localStorage.getItem('md2pdf-style') || currentStyle,
                selStart: 0, selEnd: 0, scrollRatio: 0, shared: false,
            });
            loadDocInto(docs[0]);
            showToast(t('draftRestored'));
            return true;
        }

        // No stored session at all — start from the sample document.
        docs.push({
            id: _nextDocId++,
            name: 'untitled.md',
            content: SAMPLE,
            style: currentStyle,
            selStart: 0, selEnd: 0, scrollRatio: 0, shared: false,
        });
        loadDocInto(docs[0]);
        return true;
    }

    // ── Toast ────────────────────────────────────────

    function showToast(msg) {
        toastMsg.textContent = msg;
        toastEl.classList.add('show');
        setTimeout(() => toastEl.classList.remove('show'), 2500);
    }

    // ── PDF Export ───────────────────────────────────

    let _printCSSLight = null;
    let _printCSSDark  = null;

    async function fetchPrintCSS(dark) {
        if (dark && _printCSSDark) return _printCSSDark;
        if (!dark && _printCSSLight) return _printCSSLight;

        const mdURL   = dark
            ? 'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.1/github-markdown-dark.min.css'
            : 'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.1/github-markdown-light.min.css';
        const hljsURL = dark
            ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css'
            : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';

        const [mdCSS, hljsCSS] = await Promise.all([
            fetch(mdURL).then(r => r.text()).catch(() => ''),
            fetch(hljsURL).then(r => r.text()).catch(() => ''),
        ]);
        const result = mdCSS + '\n' + hljsCSS;
        if (dark) _printCSSDark = result; else _printCSSLight = result;
        return result;
    }

    function getStyleCSSForPrint() {
        const style = STYLES[currentStyle];
        let css = style?.css || '';
        // Strip theme-specific selectors — use the raw rules directly
        if (style?.dark) {
            // Dark style: remove [data-theme="light"] rules, keep dark rules unwrapped
            css = css.replace(/\[data-theme="light"\][^\{]*\{[^}]*\}/g, '');
            css = css.replace(/\[data-theme="dark"\]\s*/g, '');
        } else {
            // Light style: remove [data-theme="dark"] rules, keep light rules unwrapped
            css = css.replace(/\[data-theme="dark"\][^\{]*\{[^}]*\}/g, '');
            css = css.replace(/\[data-theme="light"\]\s*/g, '');
        }
        return css;
    }

    // The UI has two independent notions of "dark": the app-level theme
    // toggle (data-theme="dark" on <html>) and styles that are dark by
    // definition (Dracula, Terminal). Exports render into a fresh document
    // that has no data-theme attribute, so both must be resolved here and
    // carried over explicitly — otherwise a dark UI exports as light.
    function resolveExportTheme() {
        const style = STYLES[currentStyle] || STYLES.notion;
        const appDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const dark = appDark || style.dark === true;
        // Prefer the preview's real painted background over the style's static
        // value: it already accounts for the theme toggle.
        const previewBg = getComputedStyle(preview).backgroundColor;
        const bg = (previewBg && previewBg !== 'rgba(0, 0, 0, 0)' && previewBg !== 'transparent')
            ? previewBg
            : (style.bg || (dark ? '#0d1117' : '#ffffff'));
        return { style, dark, appDark, bg, fg: dark ? '#e6edf3' : '#1f2328' };
    }

    async function captureExportSnapshot() {
        for (;;) {
            if (renderTimer !== null) render();
            const generation = renderGeneration;
            const promise = renderPromise;
            await promise;
            if (renderTimer !== null || generation !== renderGeneration || promise !== renderPromise) continue;
            if (renderError !== null) throw renderError;

            const appStylesheet = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
                .find(link => new URL(link.href).pathname === '/style.css');
            if (!appStylesheet) throw new Error('Export stylesheet is unavailable.');
            const { dark, appDark, bg, fg } = resolveExportTheme();
            return {
                content: preview.innerHTML,
                baseName: currentFileName.replace(/\.(md|markdown|txt|mdx)$/i, ''),
                styleCSS: getStyleCSSForPrint(),
                previewStyleCSS: styleOverride.textContent,
                userCSS: customCSSInput.value || '',
                dark, appDark, bg, fg,
                imageWidth: IMAGE_EXPORT_W,
                appStylesheetURL: appStylesheet.href,
                fontStylesheetURLs: Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
                    .filter(link => link.href.startsWith('https://fonts.googleapis.com/'))
                    .map(link => link.href),
            };
        }
    }

    const EXPORT_TABLE_CSS = `
.markdown-body table {
  display: table !important;
  width: 100% !important; max-width: 100% !important; min-width: 0 !important;
  table-layout: fixed !important; overflow: visible !important;
}
.markdown-body th, .markdown-body td {
  min-width: 0 !important; overflow-wrap: anywhere !important;
  word-break: break-word !important; white-space: normal !important;
}`;

    function fitExportTables(root) {
        const view = root.ownerDocument.defaultView;
        for (const table of root.querySelectorAll('table')) {
            if (!table.querySelector('th, td')) continue;
            const parent = table.parentElement;
            const parentStyle = view.getComputedStyle(parent);
            const availableWidth = parent.clientWidth - parseFloat(parentStyle.paddingLeft) - parseFloat(parentStyle.paddingRight);
            if (!Number.isFinite(availableWidth) || availableWidth <= 0) {
                throw new Error('Cannot measure export table width.');
            }
            let requiredWidth = Math.max(table.getBoundingClientRect().width, table.scrollWidth);
            if (requiredWidth <= availableWidth + 1) continue;

            // Freeze computed pixel sizes before changing inherited font sizes.
            const properties = ['font-size', 'line-height', 'letter-spacing',
                'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
                'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'];
            const originals = [table, ...table.querySelectorAll('*')].map(element => {
                const computed = view.getComputedStyle(element);
                const sizes = [];
                for (const property of properties) {
                    const value = computed.getPropertyValue(property);
                    if (value.endsWith('px') && Number.isFinite(parseFloat(value))) {
                        sizes.push([property, parseFloat(value)]);
                    }
                }
                return { element, sizes };
            });
            const spacing = view.getComputedStyle(table).borderSpacing.split(/\s+/).map(parseFloat);
            let scale = 1;
            for (let round = 0; round < 24 && requiredWidth > availableWidth + 1; round++) {
                scale *= Math.min(0.95, availableWidth / requiredWidth);
                if (!Number.isFinite(scale) || scale <= 0) break;
                for (const { element, sizes } of originals) {
                    for (const [property, value] of sizes) {
                        element.style.setProperty(property, `${value * scale}px`, 'important');
                    }
                }
                table.style.setProperty('border-spacing', spacing.map(value => `${value * scale}px`).join(' '), 'important');
                requiredWidth = Math.max(table.getBoundingClientRect().width, table.scrollWidth);
            }
            if (!Number.isFinite(scale) || scale <= 0 || requiredWidth > availableWidth + 1) {
                throw new Error('Table is too wide to export without clipping.');
            }
        }
    }

    // html2canvas positions every text segment with DOM Range measurements but
    // paints it with canvas fillText. Where the two disagree on glyph advances
    // (macOS Firefox paints ~0.7-1.3px per glyph wider than layout), each
    // segment overruns into the next one and characters visibly overlap in the
    // exported image. Measurement happens in a cloned document with its own
    // Range realm, so the correction hooks in through html2canvas's onclone
    // callback: single-line segments are re-measured with canvas metrics and
    // placed just after the previous segment's painted edge, keeping the DOM
    // gap. Positioning then uses the same metrics as painting, so overlap is
    // impossible. Segments spanning lines are returned untouched — html2canvas
    // splits those per grapheme, one line at a time, which lands back here.
    // On engines where DOM and canvas agree (drift = 0) the returned boxes are
    // identical to the native ones, so consistent platforms are unaffected.
    function alignTextToCanvasAdvances(doc) {
        const view = doc.defaultView;
        if (!view || !view.Range) return;
        const meter = doc.createElement('canvas').getContext('2d');
        const nativeGetClientRects = view.Range.prototype.getClientRects;
        // Inline boxes on one visual line report slightly different rect
        // tops (per-font metrics, device-pixel snapping) while real wrapped
        // lines sit a full line height apart, so lines are matched within a
        // few px. Exact float matching used to break the drift chain at
        // inline box boundaries (e.g. the end of a styled link), throwing the
        // next word back to its uncorrected position on top of the painted
        // text before it.
        const LINE_TOL = 4;
        let lastRun = null;

        view.Range.prototype.getClientRects = function () {
            const rects = nativeGetClientRects.call(this);
            if (this.startContainer !== this.endContainer ||
                this.startContainer.nodeType !== Node.TEXT_NODE) return rects;
            const text = this.toString();
            const boxes = Array.from(rects).filter(rect => rect.width !== 0);
            if (!text.trim() || boxes.length === 0) return rects;

            const first = boxes[0];
            const firstMid = first.top + first.height / 2;
            const wrapped = boxes.some(
                rect => Math.abs(rect.top + rect.height / 2 - firstMid) > LINE_TOL);
            if (wrapped) return rects;

            // A single line may be split into several rects (inline box
            // boundaries, pixel snapping); the segment spans their union.
            let domLeft = Infinity;
            let domRight = -Infinity;
            for (const rect of boxes) {
                domLeft = Math.min(domLeft, rect.left);
                domRight = Math.max(domRight, rect.left + rect.width);
            }

            const host = this.startContainer.parentElement;
            if (!host) return rects;
            const style = view.getComputedStyle(host);
            meter.font = [style.fontStyle, style.fontVariant, style.fontWeight,
                style.fontSize, style.fontFamily].join(' ');
            const paintedWidth = meter.measureText(text).width;

            // Positions stay anchored to the DOM's left edge (and its gaps)
            // but carry the accumulated over-paint of earlier segments on the
            // same line, so each segment starts after the previous painted
            // edge: paintedRight <= next.x. The invariant holds
            // unconditionally — including across table cells on one line,
            // which simply inherit the line's correction.
            const run = lastRun && Math.abs(lastRun.mid - firstMid) <= LINE_TOL
                ? lastRun
                : null;
            const x = run ? domLeft + (run.paintedRight - run.domRight) : domLeft;
            lastRun = { mid: firstMid, domRight, paintedRight: x + paintedWidth };
            return [new view.DOMRect(x, first.top, paintedWidth, first.height)];
        };
    }

    async function writeExportDocument(iframe, html) {
        const doc = iframe.contentDocument;
        await new Promise((resolve, reject) => {
            const loaded = () => resolve();
            iframe.addEventListener('load', loaded, { once: true });
            try {
                doc.open();
                doc.write(html);
                doc.close();
            } catch (err) {
                iframe.removeEventListener('load', loaded);
                reject(err);
            }
        });
        if (doc.fonts) await doc.fonts.ready;
        return doc;
    }

    // Set the export overlay's message for the format being produced.
    function setExportStatus(key) {
        const p = document.querySelector('.export-modal p');
        if (p) p.textContent = t(key);
    }

    async function exportPDF(paginated) {
        const btnLabel = exportBtn.querySelector('span');
        exportBtn.classList.add('loading');
        if (btnLabel) btnLabel.textContent = 'Preparing...';
        setExportStatus('generatingPdf');
        exportOverlay.classList.add('active');

        let iframe = null;
        try {
            const snapshot = await captureExportSnapshot();
            const { dark, bg: bodyBg, fg: bodyFg, appDark, styleCSS, userCSS, content } = snapshot;
            const css = await fetchPrintCSS(dark);

            // Margins always live on <body>, never on @page. A background only
            // paints inside the content box, so @page margins leave the margin
            // band unpainted — a white border on any non-white document.
            // box-decoration-break:clone repeats body's padding and background
            // on every page fragment; without it only the first page is inset.
            // Continuous: the page box is stretched to the content height (one
            // unbroken page).
            const pageRule  = paginated ? '@page { margin: 0; size: A4; }'
                                        : '@page { margin: 0; size: 210mm 297mm; }';
            const bodyRule  = paginated
                ? 'margin: 0; padding: 18mm 16mm; box-sizing: border-box;'
                  + ' -webkit-box-decoration-break: clone; box-decoration-break: clone;'
                : 'margin: 0; padding: 18mm 16mm;';

            // A single code block, table or list taller than a page can never fit,
            // so break-inside:avoid would be ignored anyway. Drop it for those
            // nodes only, letting the engine split them instead of overflowing.
            // Must come after the base break-inside:avoid block to win.
            const pageBreakCSS = paginated ? `
.markdown-body pre, .markdown-body table, .markdown-body tr { break-inside: auto; page-break-inside: auto; }
.markdown-body thead { display: table-header-group; }
.markdown-body tfoot { display: table-footer-group; }
` : '';

            iframe = document.createElement('iframe');
            iframe.style.cssText = 'position:fixed;inset:0;width:210mm;height:0;border:none;opacity:0;pointer-events:none;';
            document.body.appendChild(iframe);

            const doc = await writeExportDocument(iframe, `<!DOCTYPE html>
<html data-theme="${appDark ? 'dark' : 'light'}">
<head>
<meta charset="UTF-8">
<title> </title>
<style>${css}</style>
<style>${styleCSS}</style>
<style>${userCSS}</style>
<style>
${pageRule}
html {
  background: ${bodyBg} !important;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  color-adjust: exact;
}
body {
  ${bodyRule}
  background: ${bodyBg} !important;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  color-adjust: exact;
}
.markdown-body {
  max-width: 100%; padding: 0;
  font-size: 15px; line-height: 1.7;
  color: ${bodyFg};
}
.markdown-body p, .markdown-body li, .markdown-body pre,
.markdown-body blockquote, .markdown-body table, .markdown-body tr,
.markdown-body img { break-inside: avoid; page-break-inside: avoid; }
.markdown-body h1,.markdown-body h2,.markdown-body h3,
.markdown-body h4,.markdown-body h5,.markdown-body h6 {
  break-inside: avoid; page-break-inside: avoid;
  break-after: avoid;  page-break-after: avoid;
}
${pageBreakCSS}.markdown-body pre { white-space: pre-wrap; word-wrap: break-word; overflow-x: hidden; }
/* github-markdown-css ships ".markdown-body pre > code { white-space: pre }",
   which beats the rule above and lets long lines run past the page box. */
.markdown-body pre > code { white-space: pre-wrap; word-wrap: break-word; }
.markdown-body code {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.9em;
}
.markdown-body img { max-width: 100%; }
.markdown-body table { font-size: 13px; }
.code-block-header { display: none; }
.code-block-wrapper { border: none; overflow: visible; margin: 16px 0; }
.code-block-wrapper pre { border-radius: 6px !important; }
${EXPORT_TABLE_CSS}
</style>
</head>
<body>
<article class="markdown-body">${content}</article>
</body>
</html>`);
            fitExportTables(doc.querySelector('article.markdown-body'));

            if (!paginated) {
                // Measure and set continuous page height
                const bodyH = doc.body.scrollHeight;
                const pageSizeEl = doc.createElement('style');
                pageSizeEl.textContent = `@page { margin: 0; size: 210mm ${bodyH + 1}px; }`;
                doc.head.appendChild(pageSizeEl);
                await new Promise(r => setTimeout(r, 100));
            }


            iframe.contentWindow.focus();
            iframe.contentWindow.print();

            const cleanup = () => { if (iframe.parentNode) document.body.removeChild(iframe); };
            iframe.contentWindow.onafterprint = cleanup;
            setTimeout(cleanup, 120_000);

        } catch (err) {
            console.error('Export failed', err);
            if (iframe) iframe.remove();
            alert('Export failed.');
        } finally {
            exportOverlay.classList.remove('active');
            exportBtn.classList.remove('loading');
            if (btnLabel) btnLabel.textContent = t('export');
        }
    }

    // ── HTML Export ──────────────────────────────────

    async function exportHTML() {
        const snapshot = await captureExportSnapshot();
        const { dark, bg: bodyBg, fg: bodyFg, appDark, styleCSS, userCSS, content, baseName: title } = snapshot;
        const css = await fetchPrintCSS(dark);

        const html = `<!DOCTYPE html>
<html lang="en" data-theme="${appDark ? 'dark' : 'light'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>${css}</style>
<style>${styleCSS}</style>
<style>${userCSS}</style>
<style>
body {
  margin: 0; padding: 40px 20px;
  background: ${bodyBg};
  display: flex; justify-content: center;
}
.markdown-body {
  max-width: 960px; width: 100%;
  padding: 32px;
  font-size: 15px; line-height: 1.7;
  color: ${bodyFg};
}
.code-block-wrapper {
  position: relative; margin: 16px 0; border-radius: 8px;
  overflow: hidden; border: 1px solid ${dark ? '#30363d' : '#d1d9e0'};
  background: ${dark ? '#161b22' : '#f6f8fa'};
}
.code-block-wrapper pre { margin: 0 !important; border: none !important; border-radius: 0 !important; }
.code-block-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 4px 6px 4px 14px; min-height: 32px;
  background: ${dark ? '#0d1117' : '#f0f3f6'};
  border-bottom: 1px solid ${dark ? '#30363d' : '#d1d9e0'};
}
.code-block-lang {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.5px; color: ${dark ? '#7d8590' : '#656d76'};
}
.code-copy-btn {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 11px; font-weight: 500; cursor: pointer;
  color: ${dark ? '#7d8590' : '#656d76'};
  background: transparent; border: 1px solid transparent;
  border-radius: 6px; padding: 4px 10px;
}
.code-copy-btn:hover {
  color: ${dark ? '#e6edf3' : '#1f2328'};
  background: ${dark ? '#161b22' : '#fff'};
  border-color: ${dark ? '#30363d' : '#d1d9e0'};
}
.code-copy-btn.copied { color: #22c55e; }
</style>
</head>
<body>
<article class="markdown-body">${content}</article>
<script>
document.querySelectorAll('.code-copy-btn').forEach(function(btn){
  btn.addEventListener('click',function(){
    var pre=btn.closest('.code-block-wrapper').querySelector('pre');
    navigator.clipboard.writeText(pre.textContent).then(function(){
      var label=btn.querySelector('.code-copy-label');
      var svg=btn.querySelector('svg');
      label.textContent='Copied!';
      svg.innerHTML='<polyline points="20 6 9 17 4 12"/>';
      btn.classList.add('copied');
      setTimeout(function(){
        label.textContent='Copy';
        svg.innerHTML='<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>';
        btn.classList.remove('copied');
      },2000);
    });
  });
});
</script>
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = title + '.html';
        a.click();
        URL.revokeObjectURL(url);
        showToast(t('htmlDownloaded'));
    }

    function exportMarkdown() {
        const baseName = currentFileName.replace(/\.(md|markdown|txt|mdx)$/i, '');
        const blob = new Blob([editor.value], { type: 'text/markdown;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = baseName + '.md';
        a.click();
        URL.revokeObjectURL(url);
        showToast(t('mdDownloaded'));
    }

    // ── Dropdowns ────────────────────────────────────

    function initDropdowns() {
        document.querySelectorAll('.dropdown').forEach(dd => {
            const trigger = dd.querySelector('.btn, button:first-child');
            if (trigger) {
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Close others
                    document.querySelectorAll('.dropdown.open').forEach(d => {
                        if (d !== dd) d.classList.remove('open');
                    });
                    dd.classList.toggle('open');
                });
            }
        });

        document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
        });

        // Prevent menu clicks from closing immediately
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.addEventListener('click', (e) => e.stopPropagation());
        });
    }

    // ── Scroll Sync ──────────────────────────────────

    function initScrollSync() {
        let syncing = false;

        editor.addEventListener('scroll', () => {
            if (syncing) return;
            syncing = true;
            const pct = editor.scrollTop / Math.max(1, editor.scrollHeight - editor.clientHeight);
            previewContainer.scrollTop = pct * (previewContainer.scrollHeight - previewContainer.clientHeight);
            requestAnimationFrame(() => { syncing = false; });
        });

        previewContainer.addEventListener('scroll', () => {
            if (syncing) return;
            syncing = true;
            const pct = previewContainer.scrollTop / Math.max(1, previewContainer.scrollHeight - previewContainer.clientHeight);
            editor.scrollTop = pct * (editor.scrollHeight - editor.clientHeight);
            requestAnimationFrame(() => { syncing = false; });
        });
    }

    // ── Export Image Pages (A4) ──────────────────────
    //
    // Screenshots are taken from our own DOM, not from the print engine, so
    // page breaks must be computed here. window.print() returns undefined and
    // exposes no page boundaries, so we measure the laid-out content, pack it
    // into fixed A4 pages, then rasterise each page separately.
    //
    // Break rules mirror the paginated PDF export:
    //   - headings never strand at the bottom of a page (keep-with-next)
    //   - a split paragraph keeps >= ORPHAN_LINES above / WIDOW_LINES below
    //   - blocks taller than a page are placed whole and clip
    //   - table headers repeat on every continuation page

    const A4_W = 794, A4_H = 1123;                                  // 210x297mm @96dpi
    const PAGE_PAD = { top: 68, right: 61, bottom: 68, left: 61 };   // 18mm / 16mm
    const PAGE_INNER_W = A4_W - PAGE_PAD.left - PAGE_PAD.right;
    const PAGE_INNER_H = A4_H - PAGE_PAD.top - PAGE_PAD.bottom;
    // The single Image export shares the paginated exports' layout: an A4-wide
    // box with A4 margins, so its measure is PAGE_INNER_W and its line breaks
    // match PDF (A4) and Images (A4). html2canvas's scale:2 turns the 794px box
    // into a 1588px-wide PNG — A4 at ~192dpi, and narrow enough to stay
    // readable on a phone or tablet instead of being a 2480px-wide strip.
    const IMAGE_EXPORT_W = A4_W;

    const HEADINGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);
    const ORPHAN_LINES = 2, WIDOW_LINES = 2;
    // Space a heading must leave for following content before it may sit at the
    // bottom of a page. Two text lines' worth.
    const MIN_FOLLOW_H = 48;

    // A unit of content that can be placed on a page. `nodes` are live DOM
    // elements; `owner` is the source element the atoms came from, so a run
    // never merges rows from two different tables or lists; `tableHead` is
    // cloned onto every page of a split table.
    function makeAtom(elements, opts = {}) {
        return {
            nodes: elements,
            owner: opts.owner || null,
            kind: opts.kind || 'block',       // block | listChunk | tableChunk
            keepWithNext: opts.keepWithNext !== false,
            tableHead: opts.tableHead || null,
        };
    }

    // A code listing taller than a page is split into per-page chunks. Works on
    // the plain text and re-highlights each chunk, which is far more robust
    // than slicing rendered markup: highlight.js emits a tree of nested spans
    // that do not align with line boundaries.
    function splitOversized(el, stage) {
        const pre = el.tagName === 'PRE' ? el : el.querySelector(':scope > pre');
        if (!pre) return null;
        const wrapper = pre.closest('.code-block-wrapper') || pre.parentElement;
        const lines = pre.textContent.replace(/\n$/, '').split('\n');
        if (lines.length < 8) return null;

        const codeEl = pre.querySelector('code');
        const lang = (codeEl?.className.match(/language-([\w-]+)/) || [])[1]
                  || (pre.parentElement?.querySelector('.code-lang')?.textContent || '').trim()
                  || null;

        // Measure a single line to learn the usable line count per page.
        const probe = buildCodeChunk(wrapper, pre, codeEl, ['x'], lang);
        Object.assign(probe.style, {
            position: 'absolute', visibility: 'hidden', left: '-99999px', top: '0',
            width: PAGE_INNER_W + 'px',
        });
        stage.appendChild(probe);
        const oneLine = probe.getBoundingClientRect().height;
        stage.removeChild(probe);
        if (!(oneLine > 0)) return null;

        const capacity = Math.max(4, Math.floor(PAGE_INNER_H / oneLine) - 1);
        if (lines.length <= capacity) return null;

        const out = [];
        for (let i = 0; i < lines.length; i += capacity) {
            out.push(buildCodeChunk(wrapper, pre, codeEl, lines.slice(i, i + capacity), lang, i > 0));
        }
        return out;
    }

    // Build one page-sized copy of a code block holding `lines`. The first
    // chunk keeps the rounded top corners; continuation chunks lose the top
    // radius and border so the split reads as one continuous listing.
    function buildCodeChunk(wrapper, pre, codeEl, lines, lang, cont) {
        const w = wrapper.cloneNode(false);
        const p = document.createElement('pre');
        p.className = pre.className;
        const c = document.createElement('code');
        if (codeEl) c.className = codeEl.className;
        const text = lines.join('\n');
        c.innerHTML = highlightChunk(text, lang);
        p.appendChild(c);
        w.appendChild(p);
        if (cont) {
            // Square off the seam and cancel the vertical padding/margin the
            // <pre> adds, so consecutive chunks read as one continuous listing
            // with no blank band at the page break.
            w.style.marginTop = '-16px';
            const firstPre = w.querySelector('pre');
            if (firstPre) {
                firstPre.style.borderTopLeftRadius = '0';
                firstPre.style.borderTopRightRadius = '0';
                firstPre.style.paddingTop = '0';
                firstPre.style.marginTop = '0';
            }
        }
        return w;
    }

    function highlightChunk(text, lang) {
        const escaped = text.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
        try {
            if (window.hljs) {
                if (lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(text, { language: lang }).value;
                }
                return hljs.highlightAuto(text).value;
            }
        } catch (e) { /* fall back to escaped text */ }
        return escaped;
    }

    // The single picture of a block that is nothing but that picture: a bare
    // <img>, or a paragraph holding one image, possibly inside one link.
    // Anything else - prose around the picture, several pictures in one box -
    // stays whole, because slicing it would drop every picture but the first.
    // The link itself is not carried into the bands: a page image has no
    // hyperlinks, and the band pins the picture to its measured size.
    function soleImage(el) {
        if (el.tagName === 'IMG') return el;
        if (el.tagName !== 'P' || el.textContent.trim() !== '' || el.children.length !== 1) return null;
        let node = el.firstElementChild;
        if (node.tagName === 'A') {
            if (node.textContent.trim() !== '' || node.children.length !== 1) return null;
            node = node.firstElementChild;
        }
        return node.tagName === 'IMG' ? node : null;
    }

    // An image taller than a page has no line structure to split on, so it is
    // cut into horizontal bands instead. Each band re-shows the same source
    // image with the rest of it hidden, so the bands tile back into the
    // original picture across pages without losing any of it.
    // Returns null when `el` is not a standalone image, or when it already fits.
    function splitImage(el) {
        const img = soleImage(el);
        if (!img) return null;

        const r = img.getBoundingClientRect();
        const w = Math.round(r.width), h = Math.round(r.height);
        // A zero-size box means the image never loaded; there is no geometry to
        // slice, so leave it to the oversized fallback.
        if (!(w > 0) || !(h > PAGE_INNER_H)) return null;

        const wrapTag = el.tagName === 'P' ? 'p' : 'div';
        const bands = [];
        for (let top = 0; top < h; top += PAGE_INNER_H) {
            const box = document.createElement(wrapTag);
            Object.assign(box.style, {
                width: w + 'px', height: Math.min(PAGE_INNER_H, h - top) + 'px',
                overflow: 'hidden', margin: '0',
            });
            const copy = img.cloneNode(false);
            copy.removeAttribute('id');
            // Inline sizes pin the band to the source pixels, and the negative
            // offset selects which slice of the image lands inside it.
            Object.assign(copy.style, {
                display: 'block', width: w + 'px', height: h + 'px',
                maxWidth: 'none', marginTop: (-top) + 'px',
            });
            box.appendChild(copy);
            bands.push(box);
        }
        return bands;
    }

    // A blockquote is a sequence of self-contained child blocks (paragraphs,
    // nested lists, code). Cutting between children keeps every paragraph whole
    // and lets a long quote flow onto the next page instead of being clipped.
    // Returns null when the quote already fits, or when one child block is
    // itself taller than a page and cannot be cut here.
    function splitBlockquote(el) {
        const kids = Array.from(el.children);
        if (kids.length < 2) return null;

        // Margins collapse, so the quote's own box height understates how far
        // it reaches. Measure the span its children actually occupy instead.
        const outer = el.getBoundingClientRect();
        const boxH = kids[kids.length - 1].getBoundingClientRect().bottom - outer.top;
        if (!(boxH > PAGE_INNER_H)) return null;

        // Break between children using their real laid-out offsets. Heights
        // cannot simply be summed: sibling <p> margins collapse into the gaps
        // between boxes, so a running total of box heights would undercount and
        // keep the whole quote in one group. The children are already in the
        // document, so their offsets include those collapsed margins.
        const origin = kids[0].getBoundingClientRect().top;
        const groups = [];
        let cur = null;
        for (const kid of kids) {
            const r = kid.getBoundingClientRect();
            if (r.height > PAGE_INNER_H) {
                // This child alone outgrows a page (an embedded full-page image,
                // say). Hand the whole quote to the oversized fallback.
                return null;
            }
            if (cur && r.bottom - origin > PAGE_INNER_H) {
                groups.push(cur);
                cur = null;
            }
            (cur || (cur = [])).push(kid);
        }
        if (cur) groups.push(cur);
        if (groups.length < 2) return null;

        return groups.map((group, i) => {
            // Clone the quote box itself so `cite`/`style`/classes survive the
            // split; the id must not, or the parts would share one.
            const bq = el.cloneNode(false);
            bq.removeAttribute('id');
            for (const kid of group) bq.appendChild(kid.cloneNode(true));
            // Continuation quotes follow immediately after the previous one when
            // they share a page; tighten the gap so the quoted text reads on.
            if (i > 0) bq.style.marginTop = '-0.5em';
            return bq;
        });
    }

    // Break the article into atoms. Lists and large tables become several
    // atoms so they can flow across pages; everything else stays whole.
    function buildAtoms(root, stage) {
        const atoms = [];
        for (const el of Array.from(root.children)) {
            if (el.tagName === 'UL' || el.tagName === 'OL') {
                const items = Array.from(el.children).filter(c => c.tagName === 'LI');
                if (items.length > ORPHAN_LINES + WIDOW_LINES) {
                    for (let i = 0; i < items.length; i += ORPHAN_LINES) {
                        atoms.push(makeAtom(items.slice(i, i + ORPHAN_LINES), { kind: 'listChunk', owner: el }));
                    }
                } else {
                    atoms.push(makeAtom([el]));
                }
                continue;
            }
            if (el.tagName === 'TABLE') {
                const tbody = el.querySelector(':scope > tbody');
                const rows  = tbody ? Array.from(tbody.children).filter(c => c.tagName === 'TR') : [];
                if (rows.length > ORPHAN_LINES + WIDOW_LINES) {
                    const head = el.querySelector(':scope > thead');
                    const cloneHead = head ? head.cloneNode(true) : null;
                    for (let i = 0; i < rows.length; i += 1) {
                        atoms.push(makeAtom(rows.slice(i, i + 1), {
                            kind: 'tableChunk',
                            owner: el,
                            tableHead: cloneHead,
                        }));
                    }
                } else {
                    atoms.push(makeAtom([el]));
                }
                continue;
            }
            // A picture or quote taller than a page is cut up front so it
            // flows across pages instead of being clipped by the page box.
            const imageBands = splitImage(el);
            if (imageBands) {
                for (const band of imageBands) atoms.push(makeAtom([band], { kind: 'block' }));
                continue;
            }
            const quoteParts = splitBlockquote(el);
            if (quoteParts) {
                for (const part of quoteParts) atoms.push(makeAtom([part], { kind: 'block' }));
                continue;
            }
            // Code listings that span more than a page are pre-split into
            // line groups so they flow across pages like any other block.
            const parts = splitOversized(el, stage);
            if (parts && parts.length > 1) {
                for (const part of parts) atoms.push(makeAtom([part], { kind: 'codeChunk' }));
                continue;
            }
            atoms.push(makeAtom([el]));
        }
        return atoms;
    }

    function newPageEl(stage, bg) {
        const el = document.createElement('div');
        // Pages must carry the same class as the preview so style-scoped rules
        // (.markdown-body table, .markdown-body pre, ...) still apply. The
        // clone inside is the real article; this wrapper only supplies the
        // scope and the A4 box.
        el.className = 'markdown-body md2pdf-page';
        Object.assign(el.style, {
            boxSizing: 'border-box', width: A4_W + 'px', height: A4_H + 'px',
            padding: `${PAGE_PAD.top}px ${PAGE_PAD.right}px ${PAGE_PAD.bottom}px ${PAGE_PAD.left}px`,
            overflow: 'hidden', background: bg, margin: '0 auto 20px',
            maxWidth: 'none', minHeight: '0',
        });
        stage.appendChild(el);
        return el;
    }

    // Distance from the page's content top to the bottom of its last child:
    // how much of the printable area the page has used up.
    function usedOn(pg) {
        const last = pg.lastElementChild;
        if (!last) return 0;
        const cs = getComputedStyle(pg);
        const top = pg.getBoundingClientRect().top + (parseFloat(cs.paddingTop) || 0);
        return last.getBoundingClientRect().bottom - top;
    }

    // Release a page box so an oversized block is never cut off. A block that
    // outgrows a whole page is given the page to itself and the box is switched
    // to grow with its content, so html2canvas rasterises the full height
    // instead of clipping at the A4 boundary. The page's aspect ratio gives way
    // to keeping the content, which matches the Image export, where nothing is
    // cropped either.
    function releaseForOversized(pg) {
        if (usedOn(pg) <= PAGE_INNER_H) return;
        pg.style.height = 'auto';
        pg.style.minHeight = A4_H + 'px';
        pg.style.overflow = 'visible';
    }

    // Merge a run of same-kind atoms into the single element appended to a page,
    // so table borders, column widths and list bullets stay continuous.
    function mergeRun(kind, run) {
        if (kind === 'tableChunk') return packTableRun(run);
        if (kind === 'listChunk') return packListRun(run);
        return run[0].nodes[0].cloneNode(true);
    }

    // Build a standalone node for one atom that has no run-mates.
    function renderAtom(atom) {
        if (atom.kind === 'listChunk') return packListRun([atom]);
        if (atom.kind === 'tableChunk') return packTableRun([atom]);
        const node = atom.nodes[0].cloneNode(true);
        node.removeAttribute('id');
        return node;
    }

    // Group a run of consecutive table-row atoms into a single <table> that
    // spans the remainder of the page. Without this every row would render as
    // its own one-row table, losing the shared borders and column widths.
    function packTableRun(run) {
        const src = run[0].nodes[0].closest('table');
        const t = src.cloneNode(false);
        t.removeAttribute('id');
        if (run[0].tableHead) t.appendChild(run[0].tableHead.cloneNode(true));
        const tbody = document.createElement('tbody');
        for (const atom of run) {
            for (const row of atom.nodes) tbody.appendChild(row.cloneNode(true));
        }
        t.appendChild(tbody);
        const tfoot = src.querySelector(':scope > tfoot');
        if (tfoot) t.appendChild(tfoot.cloneNode(true));
        return t;
    }

    // Ordinal the first item of a list chunk has to state on its own page.
    // Walks the source list up to that item: `value` attributes reset the count
    // and `reversed` lists run backwards from their last item (or from `start`).
    function firstOrdinal(src, first) {
        const items = Array.from(src.children).filter(c => c.tagName === 'LI');
        const idx = items.indexOf(first);
        const step = src.hasAttribute('reversed') ? -1 : 1;
        const start = parseInt(src.getAttribute('start'), 10);
        let n = Number.isNaN(start) ? (step < 0 ? items.length : 1) : start;
        for (let i = 0; i < idx; i++) {
            const v = parseInt(items[i].getAttribute('value'), 10);
            n = (Number.isNaN(v) ? n : v) + step;
        }
        return n;
    }

    // Same idea for list chunks: one <ul>/<ol> per page, not one per 2 items.
    // A page carries only a slice of the source list, so `type`/`reversed` are
    // copied verbatim and `start` is restated for the first item of the slice.
    // Without this every page restarts the count at 1. Stating `start` is the
    // same as the browser default for a slice that begins at its first item,
    // so it is written unconditionally.
    function packListRun(run) {
        const src = run[0].nodes[0].parentElement;
        const list = document.createElement(src.tagName.toLowerCase());
        for (const a of ['type', 'reversed']) {
            if (src.hasAttribute(a)) list.setAttribute(a, src.getAttribute(a));
        }
        if (src.tagName === 'OL') {
            list.setAttribute('start', String(firstOrdinal(src, run[0].nodes[0])));
        }
        for (const atom of run) {
            for (const li of atom.nodes) list.appendChild(li.cloneNode(true));
        }
        return list;
    }

    /**
     * Pack atoms into A4 pages appended to `stage`.
     *
     * Fit is decided by actually appending the candidate node and measuring
     * the page, then rolling back when it does not fit. Predicting heights in a
     * detached holder is unreliable here because margins collapse, list
     * spacing depends on the wrapper, and styles resolve against the real page
     * context. A node too tall for even an empty page is placed anyway, and
     * its page grows past the A4 height so the overflowing part is rasterised
     * instead of clipped away.
     */
    function paginateIntoPages(atoms, stage, bg) {
        const pages = [];
        const newPage = () => { const p = newPageEl(stage, bg); pages.push(p); return p; };
        if (!atoms.length) { newPage(); return pages; }

        let page = newPage();

        // Try to append `node` to `pg`; roll back and return false if it does
        // not fit. When `allowOverflow` is set the node is kept regardless.
        const tryPlace = (pg, node, allowOverflow) => {
            pg.appendChild(node);
            if (allowOverflow || usedOn(pg) <= PAGE_INNER_H) return true;
            pg.removeChild(node);
            return false;
        };

        for (let i = 0; i < atoms.length; i++) {
            const atom = atoms[i];

            if (atom.kind === 'tableChunk' || atom.kind === 'listChunk') {
                // Consume every remaining atom of this kind, filling as many
                // pages as needed. Each page gets one merged table/list so
                // borders, column widths and bullets stay continuous, instead
                // of the run being fragmented into many small pieces.
                let run = [atom];
                let node = mergeRun(atom.kind, run);
                if (!tryPlace(page, node, false)) {
                    if (usedOn(page) > 0) page = newPage();
                    page.appendChild(node);
                    releaseForOversized(page);
                }

                let consumed = 1;
                for (let j = i + 1; j < atoms.length
                     && atoms[j].kind === atom.kind
                     && atoms[j].owner === atom.owner; j++) {
                    const trial = mergeRun(atom.kind, run.concat([atoms[j]]));
                    page.appendChild(trial);
                    if (usedOn(page) <= PAGE_INNER_H) {
                        page.removeChild(node);
                        run.push(atoms[j]);
                        node = trial;
                        consumed++;
                        continue;
                    }
                    page.removeChild(trial);
                    // This page is full: start the next one and keep going.
                    page = newPage();
                    const nextRun = [atoms[j]];
                    const nextNode = mergeRun(atom.kind, nextRun);
                    page.appendChild(nextNode);
                    releaseForOversized(page);
                    run = nextRun;
                    node = nextNode;
                    consumed++;
                }
                i += consumed - 1;
                continue;
            }

            const node = renderAtom(atom);
            const isHeading = HEADINGS.has(atom.nodes[0].tagName);

            // Place, rolling back to a fresh page when the current one is full.
            // A node taller than a whole page can never fit anywhere: it gets a
            // page to itself and releaseForOversized lets that box grow past the
            // A4 height, so the overflowing part is rasterised rather than
            // clipped away. Same rule for table/list runs.
            if (!tryPlace(page, node, false)) {
                if (usedOn(page) > 0) page = newPage();
                tryPlace(page, node, true);
                releaseForOversized(page);
            }

            // Keep-with-next: a heading must not be left at the foot of a page
            // with no content under it.
            if (isHeading && atoms[i + 1]) {
                if (usedOn(page) + MIN_FOLLOW_H > PAGE_INNER_H) {
                    page.removeChild(node);
                    page = newPage();
                    page.appendChild(node);
                }
            }
        }

        return pages;
    }

    async function exportImagePages() {
        const btnLabel = exportBtn.querySelector('span');
        exportBtn.classList.add('loading');
        if (btnLabel) btnLabel.textContent = t('imgPaging');
        setExportStatus('imgPaging');
        exportOverlay.classList.add('active');

        let iframe = null;
        try {
            const snapshot = await captureExportSnapshot();
            const { dark, bg: bodyBg, fg: bodyFg, appDark, styleCSS, userCSS, content } = snapshot;
            const css = await fetchPrintCSS(dark);

            iframe = document.createElement('iframe');
            iframe.style.cssText = 'position:fixed;left:-20000px;top:0;width:' + A4_W + 'px;height:' + A4_H + 'px;border:0;opacity:0;pointer-events:none;';
            document.body.appendChild(iframe);

            const doc = await writeExportDocument(iframe, `<!DOCTYPE html>
<html data-theme="${appDark ? 'dark' : 'light'}">
<head>
<meta charset="UTF-8">
<title> </title>
<style>${css}</style>
<style>${styleCSS}</style>
<style>${userCSS}</style>
<style>
html, body { margin: 0; padding: 0; background: ${bodyBg} !important; color: ${bodyFg};
  -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
body { width: ${PAGE_INNER_W}px; }
.markdown-body { max-width: none; margin: 0; padding: 0; }
/* Pages are .markdown-body themselves so style-scoped rules apply. Reset the
   preview's own box model and re-apply only the A4 page padding — the preview
   style sheet offsets .markdown-body horizontally for the editor layout. */
.markdown-body.md2pdf-page {
  margin: 0 auto !important; padding: ${PAGE_PAD.top}px ${PAGE_PAD.right}px ${PAGE_PAD.bottom}px ${PAGE_PAD.left}px !important;
  max-width: none; min-height: 0; width: auto;
}
.md2pdf-page { box-sizing: border-box; }
.code-block-header { display: none !important; }
.markdown-body pre { white-space: pre-wrap; word-wrap: break-word; overflow-x: hidden; }
/* github-markdown-css ships ".markdown-body pre > code { white-space: pre }",
   which beats the rule above and lets long lines run past the page box.
   Reset it so wrapped <pre> content actually wraps. */
.markdown-body pre > code { white-space: pre-wrap; word-wrap: break-word; }
.markdown-body code {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.9em;
}
.markdown-body img { max-width: 100%; height: auto; }
${EXPORT_TABLE_CSS}
</style>
</head>
<body>
<article class="markdown-body" id="md-src">${content}</article>
<div id="stage"></div>
</body>
</html>`);

            const stage = doc.getElementById('stage');
            const article = doc.getElementById('md-src');
            stage.style.cssText = `width:${PAGE_INNER_W}px;margin:0;`;
            fitExportTables(article);

            const atoms = buildAtoms(article, stage);
            // The source article has served its purpose; the pages carry the
            // content now, and leaving it in place would double the document.
            article.remove();
            const pages = paginateIntoPages(atoms, stage, bodyBg);

            // Rasterise each page.
            const baseName = snapshot.baseName;
            const files = {};
            for (let i = 0; i < pages.length; i++) {
                const canvas = await html2canvas(pages[i], {
                    scale: 2, useCORS: true, backgroundColor: bodyBg, logging: false,
                    onclone: alignTextToCanvasAdvances,
                });
                const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
                files[`${baseName}-${String(i + 1).padStart(2, '0')}.png`] = [new Uint8Array(await blob.arrayBuffer()), { level: 6 }];
            }

            const zipped = fflate.zipSync(files);
            const link = document.createElement('a');
            link.download = `${baseName}-a4.zip`;
            link.href = URL.createObjectURL(new Blob([zipped], { type: 'application/zip' }));
            link.click();
            setTimeout(() => URL.revokeObjectURL(link.href), 10000);
            showToast(t('imgZipped').replace('{n}', pages.length));

        } catch (err) {
            console.error('Image pages export failed', err && (err.stack || err.message || err));
            alert('Image export failed.');
        } finally {
            if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
            exportOverlay.classList.remove('active');
            exportBtn.classList.remove('loading');
            if (btnLabel) btnLabel.textContent = t('export');
        }
    }

    // ── Export Image ─────────────────────────────────

    async function exportImage() {
        setExportStatus('generatingImage');
        exportOverlay.classList.add('active');
        let iframe = null;
        try {
            const snapshot = await captureExportSnapshot();
            const css = await fetchPrintCSS(snapshot.dark);
            iframe = document.createElement('iframe');
            iframe.style.cssText = `position:fixed;left:-20000px;top:0;width:${snapshot.imageWidth}px;height:1123px;border:0;opacity:0;pointer-events:none;`;
            document.body.appendChild(iframe);
            const doc = await writeExportDocument(iframe, `<!DOCTYPE html>
<html data-theme="${snapshot.appDark ? 'dark' : 'light'}">
<head>
<meta charset="UTF-8">
${snapshot.fontStylesheetURLs.map(url => `<link rel="stylesheet" href="${url}">`).join('\n')}
<style>${css}</style>
<link rel="stylesheet" href="${snapshot.appStylesheetURL}">
<style>${snapshot.previewStyleCSS}</style>
<style>${snapshot.userCSS}</style>
<style>
html, body { height: auto; overflow: visible; margin: 0; color: ${snapshot.fg}; background: ${snapshot.bg} !important; transition: none; }
.preview-container { overflow: visible; transition: none; background: ${snapshot.bg} !important; }
.preview-container .markdown-body {
/* Height comes from the content alone. A min-height copied from the live preview would make the PNG's height - and therefore its aspect ratio - follow the window size. */
  box-sizing: border-box; width: ${snapshot.imageWidth}px; max-width: none; margin: 0;
  padding: ${PAGE_PAD.top}px ${PAGE_PAD.right}px ${PAGE_PAD.bottom}px ${PAGE_PAD.left}px;
  min-height: 0; height: auto; background-color: ${snapshot.bg} !important;
}
.code-block-header { display: none !important; }
${EXPORT_TABLE_CSS}
</style>
</head>
<body><div class="preview-container"><article class="markdown-body" id="md-image">${snapshot.content}</article></div></body>
</html>`);
            const article = doc.getElementById('md-image');
            fitExportTables(article);
            const canvas = await html2canvas(article, {
                scale: 2, useCORS: true, backgroundColor: snapshot.bg, logging: false,
                onclone: alignTextToCanvasAdvances,
            });
            const link = document.createElement('a');
            link.download = snapshot.baseName + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            showToast(t('imgDownloaded'));
        } catch (err) {
            console.error('Image export failed', err);
            alert('Image export failed.');
        } finally {
            if (iframe) iframe.remove();
            exportOverlay.classList.remove('active');
        }
    }

    // ── Share by URL ─────────────────────────────────

    const shareOverlay  = $('#shareOverlay');
    const shareUrlInput = $('#shareUrlInput');
    const shareCopyBtn  = $('#shareCopyBtn');
    const shareCloseBtn = $('#shareCloseBtn');

    function showShareModal(url) {
        shareUrlInput.value = url;
        shareOverlay.classList.add('active');
        shareUrlInput.focus();
        shareUrlInput.select();
    }

    function closeShareModal() {
        shareOverlay.classList.remove('active');
    }

    function copyShareUrl() {
        navigator.clipboard.writeText(shareUrlInput.value).then(() => {
            shareCopyBtn.textContent = 'Copied!';
            setTimeout(() => { shareCopyBtn.textContent = 'Copy'; }, 2000);
        }).catch(() => {
            shareUrlInput.select();
            document.execCommand('copy');
            shareCopyBtn.textContent = 'Copied!';
            setTimeout(() => { shareCopyBtn.textContent = 'Copy'; }, 2000);
        });
    }

    // Share state: map of doc id → { id, editKey, encKey }. The doc id is stable
    // across renames and unique per tab, so two same-named tabs never collide.
    function getShareMap() {
        try { return JSON.parse(localStorage.getItem('md2pdf-shares') || '{}'); } catch (_) { return {}; }
    }
    function saveShareMap(map) {
        localStorage.setItem('md2pdf-shares', JSON.stringify(map));
    }

    // ── E2EE (AES-256-GCM) ──────────────────────────

    async function e2eeGenerateKey() {
        const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
        const raw = await crypto.subtle.exportKey('raw', key);
        // base64url encoding (no padding)
        const b64 = btoa(String.fromCharCode(...new Uint8Array(raw)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        return { key, b64 };
    }

    function e2eeDecodeB64(b64) {
        const str = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
        const raw = new Uint8Array(str.length);
        for (let i = 0; i < str.length; i++) raw[i] = str.charCodeAt(i);
        return raw;
    }

    async function e2eeImportKey(b64) {
        return crypto.subtle.importKey('raw', e2eeDecodeB64(b64), { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    }

    async function e2eeImportKeyFull(b64) {
        return crypto.subtle.importKey('raw', e2eeDecodeB64(b64), { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    }

    async function e2eeEncrypt(plaintext, cryptoKey) {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(plaintext);
        const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, encoded);
        // Prepend IV (12 bytes) to ciphertext, then base64
        const combined = new Uint8Array(iv.length + ciphertext.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(ciphertext), iv.length);
        return btoa(String.fromCharCode(...combined));
    }

    async function e2eeDecrypt(encoded, cryptoKey) {
        const binary = atob(encoded);
        const combined = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) combined[i] = binary.charCodeAt(i);
        const iv = combined.slice(0, 12);
        const ciphertext = combined.slice(12);
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ciphertext);
        return new TextDecoder().decode(decrypted);
    }

    async function shareByURL() {
        const text = editor.value;
        if (!text.trim()) { showToast(t('nothingToShare')); return; }

        // Viewing someone else's share: surface the current URL instead of
        // creating a new /s/:id. The viewer doesn't own an editKey anyway.
        if (isSharedView) {
            showShareModal(location.href);
            return;
        }

        setExportStatus('sharing');
        exportOverlay.classList.add('active');

        try {
            const shares = getShareMap();
            // Keyed by doc id, not file name — two tabs may share a name.
            const docKey = String(activeDocId);

            // Check if we have an existing share for this document
            if (shares[docKey]) {
                const { id, editKey, encKey } = shares[docKey];

                // Send plaintext + encryption key — server re-encrypts
                const updateRes = await fetch('/api/update/' + id, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'text/plain', 'X-Edit-Key': editKey, 'X-Enc-Key': encKey },
                    body: text,
                });

                if (updateRes.ok) {
                    const data = await updateRes.json();
                    exportOverlay.classList.remove('active');
                    showShareModal(data.url + '#k=' + encKey);
                    showToast(t('linkUpdated'));
                    return;
                }
                // If update fails (404 expired, 403 wrong key), create new below
            }

            // Server encrypts and returns the key
            const res = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: text,
            });

            exportOverlay.classList.remove('active');

            if (res.ok) {
                const data = await res.json();
                shares[docKey] = { id: data.id, editKey: data.editKey, encKey: data.key };
                saveShareMap(shares);
                showShareModal(data.url + '#k=' + data.key);
                return;
            }
        } catch (_) {
            exportOverlay.classList.remove('active');
        }

        // Fallback: LZ-string URL (unencrypted, client-only)
        try {
            const compressed = LZString.compressToEncodedURIComponent(text);
            const url = `${location.origin}/share?doc=${compressed}`;
            if (url.length > 8000) {
                showToast(t('docTooLarge'));
                return;
            }
            showShareModal(url);
        } catch (e) {
            showToast(t('shareFailed'));
        }
    }

    function loadSharedContent(content) {
        // Opens as its own read-only tab — a share link must never hijack the
        // document the user is already working on, even if its content already
        // has a tab.
        createDocAndActivate({ name: 'shared.md', content, shared: true, dedup: false });
        showToast(t('sharedDocLoaded'));
    }

    function openForkModal() {
        const overlay = document.getElementById('forkOverlay');
        if (!overlay) return;
        overlay.classList.add('active');
    }

    function closeForkModal() {
        const overlay = document.getElementById('forkOverlay');
        if (!overlay) return;
        overlay.classList.remove('active');
    }

    function forkToLocalCopy() {
        // The read-only tab stays read-only; the fork is a new editable tab.
        const src = activeDoc();
        const content = src ? src.content : editor.value;
        workspace.classList.remove('preview-only', 'shared-locked');
        createDocAndActivate({ name: 'copy-of-shared.md', content, dedup: false });
        // Drop the /s/:id URL so F5 no longer re-fetches the original over local edits.
        history.replaceState(null, '', '/');
        // Switch toolbar back to split view.
        viewToggle.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        const splitBtn = viewToggle.querySelector('[data-view="split"]');
        if (splitBtn) splitBtn.classList.add('active');
        // Persist so F5 restores the copy instead of the sample.
        saveDraft();
        closeForkModal();
        showToast(t('copyCreated'));
        editor.focus();
    }

    async function loadFromURL() {
        // Try embedded content (injected by Worker for /s/:id and /share?doc=)
        const sharedEl = document.getElementById('shared-content');
        if (sharedEl) {
            try {
                const raw = JSON.parse(sharedEl.textContent);
                if (raw) {
                    // Check if content is encrypted (has #k= in URL hash)
                    const hash = location.hash;
                    const keyMatch = hash.match(/[#&]k=([A-Za-z0-9_-]+)/);
                    if (keyMatch) {
                        try {
                            const cryptoKey = await e2eeImportKey(keyMatch[1]);
                            const content = await e2eeDecrypt(raw, cryptoKey);
                            loadSharedContent(content);
                        } catch (decErr) {
                            showToast(t('decryptFailed'));
                            return true; // still consumed the URL
                        }
                    } else {
                        // Unencrypted (legacy) document
                        loadSharedContent(raw);
                    }
                    return true;
                }
            } catch (_) {}
        }

        // Fallback: try ?doc= query param (client-side decompression)
        const params = new URLSearchParams(location.search);
        const docParam = params.get('doc');
        if (docParam) {
            try {
                const content = LZString.decompressFromEncodedURIComponent(docParam);
                if (content) { loadSharedContent(content); return true; }
            } catch (_) {}
        }

        // Backward compat: try #doc= (hash)
        const hashStr = location.hash;
        if (hashStr.startsWith('#doc=')) {
            const compressed = hashStr.slice(5);
            try {
                const content = LZString.decompressFromEncodedURIComponent(compressed);
                if (content) { loadSharedContent(content); return true; }
            } catch (_) {}
        }
        return false;
    }

    // ── Fullscreen ───────────────────────────────────

    function toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen().catch(() => {});
        }
    }

    // ── Find & Replace ───────────────────────────────

    let findMatches = [];
    let findIdx = -1;

    function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

    function openFind(withReplace) {
        findPanel.classList.add('open');
        if (withReplace) replaceRow.classList.add('open');
        findInput.focus();
        findInput.select();
    }

    function closeFind() {
        findPanel.classList.remove('open');
        replaceRow.classList.remove('open');
        findMatches = [];
        findIdx = -1;
        findCount.textContent = '';
        editor.focus();
    }

    function doFind() {
        const query = findInput.value;
        if (!query) { findMatches = []; findIdx = -1; findCount.textContent = ''; return; }

        const text = editor.value;
        const regex = new RegExp(escapeRegex(query), 'gi');
        findMatches = [];
        let m;
        while ((m = regex.exec(text)) !== null) {
            findMatches.push({ s: m.index, e: m.index + m[0].length });
        }

        findIdx = findMatches.length > 0 ? 0 : -1;
        findCount.textContent = findMatches.length > 0
            ? `${1}/${findMatches.length}`
            : 'No results';
        selectFindMatch();
    }

    function selectFindMatch() {
        if (findIdx < 0 || findIdx >= findMatches.length) return;
        const m = findMatches[findIdx];
        editor.focus();
        editor.setSelectionRange(m.s, m.e);

        // Scroll to match
        const before = editor.value.substring(0, m.s);
        const lines = before.split('\n').length;
        const lh = parseFloat(getComputedStyle(editor).lineHeight) || 22;
        editor.scrollTop = Math.max(0, (lines - 3) * lh);

        findCount.textContent = `${findIdx + 1}/${findMatches.length}`;
    }

    function findNext() {
        if (findMatches.length === 0) return;
        findIdx = (findIdx + 1) % findMatches.length;
        selectFindMatch();
    }

    function findPrev() {
        if (findMatches.length === 0) return;
        findIdx = (findIdx - 1 + findMatches.length) % findMatches.length;
        selectFindMatch();
    }

    function doReplace() {
        if (findIdx < 0 || findIdx >= findMatches.length) return;
        const m = findMatches[findIdx];
        const rep = replaceInput.value;
        editor.value = editor.value.substring(0, m.s) + rep + editor.value.substring(m.e);
        scheduleRender();
        doFind();
    }

    function doReplaceAll() {
        const query = findInput.value;
        if (!query) return;
        const rep = replaceInput.value;
        const count = findMatches.length;
        editor.value = editor.value.split(query).join(rep);
        scheduleRender();
        doFind();
        showToast(`Replaced ${count} occurrences`);
    }

    function initFind() {
        findInput.addEventListener('input', doFind);

        findInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); e.shiftKey ? findPrev() : findNext(); }
            if (e.key === 'Escape') closeFind();
        });

        replaceInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); doReplace(); }
            if (e.key === 'Escape') closeFind();
        });

        findNextBtn.addEventListener('click', findNext);
        findPrevBtn.addEventListener('click', findPrev);
        findCloseBtn.addEventListener('click', closeFind);
        replaceToggleBtn.addEventListener('click', () => replaceRow.classList.toggle('open'));
        replaceBtn.addEventListener('click', doReplace);
        replaceAllBtn.addEventListener('click', doReplaceAll);
    }

    // ── Resizable split ──────────────────────────────

    function initResize() {
        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const startX = e.clientX;
            const leftW  = editorPane.offsetWidth;
            const rightW = previewPane.offsetWidth;
            resizeHandle.classList.add('active');
            document.body.style.cursor     = 'col-resize';
            document.body.style.userSelect = 'none';

            const onMove = (ev) => {
                const dx    = ev.clientX - startX;
                const total = leftW + rightW;
                const newL  = Math.max(220, Math.min(total - 220, leftW + dx));
                editorPane.style.flex  = `0 0 ${newL}px`;
                previewPane.style.flex = `0 0 ${total - newL}px`;
            };
            const onUp = () => {
                resizeHandle.classList.remove('active');
                document.body.style.cursor     = '';
                document.body.style.userSelect = '';
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    // ── Editor enhancements ──────────────────────────

    function initEditor() {
        editor.addEventListener('keydown', (e) => {
            // Ctrl+Tab cycles document tabs — it must not insert indentation.
            if (e.key === 'Tab' && !(e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                const s = editor.selectionStart;
                const end = editor.selectionEnd;
                editor.value = editor.value.substring(0, s) + '    ' + editor.value.substring(end);
                editor.selectionStart = editor.selectionEnd = s + 4;
                scheduleRender();
            }
        });
        editor.addEventListener('input', scheduleRender);
    }

    // ── Keyboard shortcuts ───────────────────────────

    function initShortcuts() {
        document.addEventListener('keydown', (e) => {
            const mod = e.ctrlKey || e.metaKey;
            if (mod && e.key === 's') { e.preventDefault(); exportPDF(); }
            if (mod && e.shiftKey && (e.key === 'L' || e.key === 'l')) { e.preventDefault(); toggleTheme(); }
            if (mod && e.key === 'f') { e.preventDefault(); openFind(false); }
            if (mod && e.key === 'h') { e.preventDefault(); openFind(true); }
            if (e.key === 'F11') { e.preventDefault(); toggleFullscreen(); }

            // Tab shortcuts stay out of text fields — Ctrl+T / Ctrl+W are
            // reserved by the browser, so these use Alt. The editor itself is
            // exempt: it is the document surface, not a settings field.
            const inEditable = e.target instanceof Element
                && e.target !== editor
                && !!e.target.closest('input, textarea, [contenteditable]');
            if (mod && e.altKey && (e.key === 'T' || e.key === 't')) {
                if (inEditable) return;
                e.preventDefault();
                createDocAndActivate({ name: 'untitled.md', content: '' });
            }
            if (mod && e.shiftKey && (e.key === 'W' || e.key === 'w')) {
                if (inEditable) return;
                e.preventDefault();
                closeDoc(activeDocId);
            }
            if (mod && e.key === 'Tab' && docs.length > 1) {
                if (inEditable) return;
                e.preventDefault();
                cycleActiveDoc(e.shiftKey ? -1 : 1);
            }
        });
    }

    function cycleActiveDoc(step) {
        const i = docs.findIndex(d => d.id === activeDocId);
        if (i === -1) { activateDoc(docs[0].id); return; }
        const next = (i + step + docs.length) % docs.length;
        activateDoc(docs[next].id);
    }

    // ── Wire up events ───────────────────────────────

    function initEvents() {
        themeToggle.addEventListener('click', toggleTheme);

        // Language toggle
        langToggle.addEventListener('click', () => {
            applyLanguage(currentLang === 'en' ? 'es' : 'en');
        });

        // Export
        exportPDFBtn.addEventListener('click',  () => { exportDropdown.classList.remove('open'); exportPDF(false); });
        exportPDFPagesBtn.addEventListener('click', () => { exportDropdown.classList.remove('open'); exportPDF(true); });
        exportHTMLBtn.addEventListener('click', () => {
            exportDropdown.classList.remove('open');
            exportHTML().catch(err => { console.error('Export failed', err); alert('Export failed.'); });
        });
        exportMarkdownBtn.addEventListener('click', () => { exportDropdown.classList.remove('open'); exportMarkdown(); });
        exportImageBtn.addEventListener('click', () => { exportDropdown.classList.remove('open'); exportImage(); });
        exportImagePagesBtn.addEventListener('click', () => { exportDropdown.classList.remove('open'); exportImagePages(); });
        shareBtn.addEventListener('click', () => { exportDropdown.classList.remove('open'); shareByURL(); });

        // Share modal
        shareCopyBtn.addEventListener('click', copyShareUrl);
        shareCloseBtn.addEventListener('click', closeShareModal);
        shareOverlay.addEventListener('click', (e) => { if (e.target === shareOverlay) closeShareModal(); });

        // Fork (read-only → editable copy) modal
        const forkOverlay    = $('#forkOverlay');
        const forkCloseBtn   = $('#forkCloseBtn');
        const forkCancelBtn  = $('#forkCancelBtn');
        const forkConfirmBtn = $('#forkConfirmBtn');
        const sharedLockBtn  = $('#sharedLock');
        sharedLockBtn.addEventListener('click', openForkModal);
        forkCloseBtn.addEventListener('click', closeForkModal);
        forkCancelBtn.addEventListener('click', closeForkModal);
        forkConfirmBtn.addEventListener('click', forkToLocalCopy);
        forkOverlay.addEventListener('click', (e) => { if (e.target === forkOverlay) closeForkModal(); });

        // API & Prompts modal
        const apiOverlay  = $('#apiOverlay');
        const apiCloseBtn = $('#apiCloseBtn');

        $('#apiPromptsBtn').addEventListener('click', () => { apiOverlay.classList.add('active'); });
        apiCloseBtn.addEventListener('click', () => { apiOverlay.classList.remove('active'); });
        apiOverlay.addEventListener('click', (e) => { if (e.target === apiOverlay) apiOverlay.classList.remove('active'); });

        // Tabs
        document.querySelectorAll('.api-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.api-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.api-tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
            });
        });

        // Document list — one delegated listener, no per-item binding
        const docTabs = document.getElementById('docTabs');
        if (docTabs) {
            docTabs.addEventListener('click', (e) => {
                const tab = e.target.closest('.doc-tab');
                if (!tab) return;
                const id = Number(tab.dataset.docId);
                if (e.target.closest('.doc-tab-close')) {
                    if (docs.length > 1) closeDoc(id);
                    return;
                }
                activateDoc(id);
            });
        }

        // Sidebar: new document, collapse toggle
        const docNewBtn = document.getElementById('docNewBtn');
        if (docNewBtn) {
            docNewBtn.addEventListener('click', () => {
                createDocAndActivate({ name: 'untitled.md', content: '' });
                editor.focus();
            });
        }
        const docSidebarToggle = document.getElementById('docSidebarToggle');
        if (docSidebarToggle) {
            docSidebarToggle.addEventListener('click', () => {
                const side = document.getElementById('docSidebar');
                setSidebarCollapsed(!side.classList.contains('collapsed'));
            });
        }

        // Copy buttons are bound dynamically in buildPromptsTab/buildApiTab

        // Editable file name
        const commitFileName = () => {
            const val = fileNameEl.value.trim();
            currentFileName = val
                ? (val.endsWith('.md') ? val : val + '.md')
                : 'untitled.md';
            fileNameEl.value = currentFileName;
            const d = activeDoc();
            if (d) d.name = currentFileName;
            renderTabs();
            saveDraft();
        };
        fileNameEl.addEventListener('change', commitFileName);
        fileNameEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); fileNameEl.blur(); }
            if (e.key === 'Escape') { fileNameEl.value = currentFileName; fileNameEl.blur(); }
        });
        fileNameEl.addEventListener('focus', () => {
            const name = fileNameEl.value.replace(/\.(md|markdown|txt|mdx)$/i, '');
            fileNameEl.value = name;
            fileNameEl.select();
        });
        fileNameEl.addEventListener('blur', commitFileName);

        // Fullscreen
        fullscreenBtn.addEventListener('click', toggleFullscreen);

        // Upload
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => { if (e.target.files[0]) loadFile(e.target.files[0]); fileInput.value = ''; });

        // View toggle
        viewToggle.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-view]');
            if (!btn) return;
            const mode = btn.dataset.view;
            // If this is a shared (locked) doc and the user wants to see the editor,
            // ask whether to fork a local editable copy first.
            if (isSharedView && mode !== 'preview') {
                openForkModal();
                return;
            }
            viewToggle.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            workspace.classList.toggle('preview-only', mode === 'preview');
        });

        // Style select
        styleSelect.addEventListener('change', () => applyStyle(styleSelect.value));

        // Custom CSS
        customCSSToggle.addEventListener('click', () => {
            customCSSPanel.classList.toggle('open');
            customCSSToggle.classList.toggle('active');
        });
        customCSSInput.addEventListener('input', () => applyCustomCSS(false));
        $('#applyCSSBtn').addEventListener('click', () => applyCustomCSS(true));

        // Templates
        document.querySelectorAll('[data-template]').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.dataset.template;
                document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
                loadTemplate(key);
            });
        });
    }

    // ── WebMCP ────────────────────────────────────────

    function initWebMCP() {
        // Declarative: handle form submissions from AI agents
        const wmcpConvert = $('#wmcpConvert');
        const wmcpExport  = $('#wmcpExport');
        const wmcpShare   = $('#wmcpShare');

        if (wmcpConvert) {
            wmcpConvert.addEventListener('submit', (e) => {
                e.preventDefault();
                const fd = new FormData(wmcpConvert);
                const md = fd.get('markdown');
                const style = fd.get('style');
                if (md) {
                    createDocAndActivate({ name: 'agent.md', content: md, style, dedup: false });
                } else if (style && STYLES[style]) {
                    applyStyle(style);
                    const cur = activeDoc();
                    if (cur) cur.style = style;
                }
                saveDraft();
            });
        }

        if (wmcpExport) {
            wmcpExport.addEventListener('submit', (e) => {
                e.preventDefault();
                const format = new FormData(wmcpExport).get('format');
                if (format === 'pdf')       exportPDF(false);
                if (format === 'pdf-pages') exportPDF(true);
                if (format === 'html')      exportHTML().catch(err => { console.error('Export failed', err); alert('Export failed.'); });
                if (format === 'markdown')  exportMarkdown();
                if (format === 'image')     exportImage();
                if (format === 'image-pages') exportImagePages();
            });
        }

        if (wmcpShare) {
            wmcpShare.addEventListener('submit', (e) => {
                e.preventDefault();
                shareByURL();
            });
        }

        // Imperative: register tools via navigator.modelContext (Chrome Canary)
        if (typeof navigator !== 'undefined' && navigator.modelContext?.registerTool) {
            navigator.modelContext.registerTool('convert-markdown', {
                description: 'Set markdown content and render with a chosen style. Styles: notion, github, minimal, academic, corporate, latex, dracula, newspaper, handwritten, terminal, pastel.',
                params: {
                    markdown: { type: 'string', description: 'Markdown text to render' },
                    style:    { type: 'string', description: 'Visual style (default: notion)' },
                },
                execute: async ({ markdown, style }) => {
                    if (markdown) {
                        createDocAndActivate({ name: 'agent.md', content: markdown, style, dedup: false });
                    } else if (style && STYLES[style]) {
                        applyStyle(style);
                        const cur = activeDoc();
                        if (cur) cur.style = style;
                    }
                    saveDraft();
                    return { success: true, message: 'Content rendered' };
                },
            });

            navigator.modelContext.registerTool('export-document', {
                description: 'Export current document. Formats: pdf (continuous single page), pdf-pages (PDF split into A4 pages), html, markdown (raw .md source), image (single long PNG), image-pages (ZIP of A4 page PNGs).',
                params: {
                    format: { type: 'string', description: 'Export format: pdf, pdf-pages, html, markdown, image, or image-pages' },
                },
                execute: async ({ format }) => {
                    if (format === 'pdf')       await exportPDF(false);
                    if (format === 'pdf-pages') await exportPDF(true);
                    if (format === 'html')      await exportHTML();
                    if (format === 'markdown')  await exportMarkdown();
                    if (format === 'image')     await exportImage();
                    if (format === 'image-pages') await exportImagePages();
                    return { success: true, message: `Exported as ${format}` };
                },
            });

            navigator.modelContext.registerTool('share-document', {
                description: 'Generate a shareable URL for the current document and copy to clipboard.',
                params: {},
                execute: async () => {
                    shareByURL();
                    return { success: true, message: 'Share link copied to clipboard' };
                },
            });

            navigator.modelContext.registerTool('set-style', {
                description: 'Change the visual style. Options: notion, github, minimal, academic, corporate, latex, dracula, newspaper, handwritten, terminal, pastel.',
                params: {
                    style: { type: 'string', description: 'Style name' },
                },
                execute: async ({ style }) => {
                    if (STYLES[style]) { applyStyle(style); return { success: true, message: `Style set to ${style}` }; }
                    return { success: false, message: 'Unknown style' };
                },
            });
        }
    }

    // ── GitHub Stars ─────────────────────────────────

    function fetchGitHubStars() {
        fetch('https://api.github.com/repos/Jiafei-Queen/md2pdf')
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (data.stargazers_count !== undefined) {
                    var count = data.stargazers_count;
                    var label = count >= 1000 ? (count / 1000).toFixed(1) + 'k' : count;
                    var el = $('#starText');
                    if (el) el.textContent = label + ' \u2605';
                }
            })
            .catch(function () {});
    }

    // ── Boot ─────────────────────────────────────────

    async function init() {
        initMarked();
        applyTheme(getTheme());

        // Restore language (default: detect from browser)
        const savedLang = localStorage.getItem('md2pdf-lang') || (navigator.language.startsWith('es') ? 'es' : 'en');
        applyLanguage(savedLang);

        // Restore saved style (default: notion) — ?style= query param overrides
        const urlParams = new URLSearchParams(location.search);
        const urlStyle = urlParams.get('style');
        const savedStyle = (urlStyle && STYLES[urlStyle]) ? urlStyle : (localStorage.getItem('md2pdf-style') || 'notion');
        applyStyle(savedStyle);

        // ?template= query param — maps SEO-friendly slugs to internal keys
        const urlTemplate = urlParams.get('template');
        const TEMPLATE_SLUG_MAP = { 'documentation': 'docs', 'meeting-notes': 'meeting' };
        const resolvedTemplate = urlTemplate && (TEMPLATE_SLUG_MAP[urlTemplate] || urlTemplate);
        const hasValidTemplate = resolvedTemplate && TEMPLATES[resolvedTemplate] !== undefined;

        // Restore custom CSS
        const savedCSS = localStorage.getItem('md2pdf-custom-css');
        if (savedCSS) { customCSSInput.value = savedCSS; applyCustomCSS(); }

        // Restore sidebar state (language is already applied, so labels localize)
        setSidebarCollapsed(localStorage.getItem('md2pdf-sidebar-collapsed') === '1');

        // Restore the open-document session first, so share / template URLs
        // stack on top of the user's own tabs instead of replacing them.
        restoreDocs();
        renderTabs();

        // Then a shared URL or ?template= adds its own tab.
        try { await loadFromURL(); } catch (_) {}
        if (hasValidTemplate) loadTemplate(resolvedTemplate);

        render();
        initEditor();
        initDragDrop();
        initResize();
        initScrollSync();
        initFind();
        initShortcuts();
        initDropdowns();
        initEvents();
        initWebMCP();
        fetchGitHubStars();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
