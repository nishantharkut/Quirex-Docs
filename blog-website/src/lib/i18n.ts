import { createContext, useContext } from "react";

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "pt", name: "Português", flag: "🇧🇷" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
] as const;

export type LangCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

const LANG_KEY = "quirex_language";

export function getSelectedLanguage(): LangCode {
  const stored = localStorage.getItem(LANG_KEY);
  if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) return stored as LangCode;
  return "en";
}

export function setSelectedLanguage(lang: LangCode) {
  localStorage.setItem(LANG_KEY, lang);
}

export type I18nContextType = {
  language: LangCode;
  setLanguage: (lang: LangCode) => void;
};

export const I18nContext = createContext<I18nContextType>({
  language: "en",
  setLanguage: () => {},
});

export const useI18n = () => useContext(I18nContext);

/** UI strings for the platform chrome */
export const uiStrings: Record<string, Record<LangCode, string>> = {
  search: { en: "Search", es: "Buscar", fr: "Rechercher", de: "Suchen", ja: "検索", zh: "搜索", pt: "Buscar", ko: "검색" },
  searchDocs: { en: "Search documentation...", es: "Buscar documentación...", fr: "Rechercher dans la documentation...", de: "Dokumentation durchsuchen...", ja: "ドキュメントを検索...", zh: "搜索文档...", pt: "Buscar documentação...", ko: "문서 검색..." },
  docs: { en: "Documentation", es: "Documentación", fr: "Documentation", de: "Dokumentation", ja: "ドキュメント", zh: "文档", pt: "Documentação", ko: "문서" },
  admin: { en: "Admin", es: "Admin", fr: "Admin", de: "Admin", ja: "管理", zh: "管理", pt: "Admin", ko: "관리자" },
  changelog: { en: "Changelog", es: "Registro de cambios", fr: "Journal des modifications", de: "Änderungsprotokoll", ja: "変更履歴", zh: "更新日志", pt: "Registro de alterações", ko: "변경 로그" },
  readMore: { en: "Read more", es: "Leer más", fr: "Lire la suite", de: "Weiterlesen", ja: "続きを読む", zh: "阅读更多", pt: "Leia mais", ko: "더 읽기" },
  minRead: { en: "min read", es: "min de lectura", fr: "min de lecture", de: "Min. Lesezeit", ja: "分で読める", zh: "分钟阅读", pt: "min de leitura", ko: "분 읽기" },
  previous: { en: "Previous", es: "Anterior", fr: "Précédent", de: "Zurück", ja: "前へ", zh: "上一页", pt: "Anterior", ko: "이전" },
  next: { en: "Next", es: "Siguiente", fr: "Suivant", de: "Weiter", ja: "次へ", zh: "下一页", pt: "Próximo", ko: "다음" },
  comments: { en: "Comments", es: "Comentarios", fr: "Commentaires", de: "Kommentare", ja: "コメント", zh: "评论", pt: "Comentários", ko: "댓글" },
  addComment: { en: "Add comment", es: "Agregar comentario", fr: "Ajouter un commentaire", de: "Kommentar hinzufügen", ja: "コメントを追加", zh: "添加评论", pt: "Adicionar comentário", ko: "댓글 추가" },
  wasHelpful: { en: "Was this page helpful?", es: "¿Te resultó útil esta página?", fr: "Cette page vous a-t-elle été utile ?", de: "War diese Seite hilfreich?", ja: "このページは役に立ちましたか？", zh: "此页面对您有帮助吗？", pt: "Esta página foi útil?", ko: "이 페이지가 도움이 되었나요?" },
  thanksFeedback: { en: "Thanks for your feedback!", es: "¡Gracias por tu opinión!", fr: "Merci pour votre retour !", de: "Danke für Ihr Feedback!", ja: "フィードバックありがとうございます！", zh: "感谢您的反馈！", pt: "Obrigado pelo seu feedback!", ko: "피드백 감사합니다!" },
  protected: { en: "Protected", es: "Protegido", fr: "Protégé", de: "Geschützt", ja: "保護", zh: "受保护", pt: "Protegido", ko: "보호됨" },
  noResults: { en: "No results for", es: "Sin resultados para", fr: "Aucun résultat pour", de: "Keine Ergebnisse für", ja: "検索結果なし：", zh: "没有结果：", pt: "Sem resultados para", ko: "검색 결과 없음:" },
  typeToSearch: { en: "Type to search", es: "Escribe para buscar", fr: "Tapez pour rechercher", de: "Tippen zum Suchen", ja: "入力して検索", zh: "输入以搜索", pt: "Digite para buscar", ko: "검색어를 입력하세요" },
  navigation: { en: "Navigation", es: "Navegación", fr: "Navigation", de: "Navigation", ja: "ナビゲーション", zh: "导航", pt: "Navegação", ko: "탐색" },
  pageNotFound: { en: "Page not found", es: "Página no encontrada", fr: "Page non trouvée", de: "Seite nicht gefunden", ja: "ページが見つかりません", zh: "页面未找到", pt: "Página não encontrada", ko: "페이지를 찾을 수 없습니다" },
  backToDocs: { en: "← Back to docs", es: "← Volver a los docs", fr: "← Retour aux docs", de: "← Zurück zu Docs", ja: "← ドキュメントに戻る", zh: "← 返回文档", pt: "← Voltar aos docs", ko: "← 문서로 돌아가기" },
  noComments: { en: "No comments yet. Be the first to share your thoughts.", es: "Aún no hay comentarios. Sé el primero en compartir.", fr: "Pas encore de commentaires. Soyez le premier.", de: "Noch keine Kommentare. Seien Sie der Erste.", ja: "まだコメントはありません。最初のコメントを投稿してください。", zh: "暂无评论。成为第一个评论的人。", pt: "Nenhum comentário ainda. Seja o primeiro a compartilhar.", ko: "아직 댓글이 없습니다. 첫 번째로 의견을 남겨보세요." },
  yourName: { en: "Your name", es: "Tu nombre", fr: "Votre nom", de: "Ihr Name", ja: "お名前", zh: "您的名字", pt: "Seu nome", ko: "이름" },
  writeComment: { en: "Write a comment...", es: "Escribe un comentario...", fr: "Écrire un commentaire...", de: "Kommentar schreiben...", ja: "コメントを書く...", zh: "写评论...", pt: "Escreva um comentário...", ko: "댓글을 작성하세요..." },
  post: { en: "Post", es: "Publicar", fr: "Publier", de: "Posten", ja: "投稿", zh: "发布", pt: "Publicar", ko: "게시" },
  newComment: { en: "New Comment", es: "Nuevo comentario", fr: "Nouveau commentaire", de: "Neuer Kommentar", ja: "新しいコメント", zh: "新评论", pt: "Novo comentário", ko: "새 댓글" },

  // Landing page — Hero
  heroBadge: { en: "Open source · Self-hostable · No vendor lock-in", es: "Código abierto · Auto-alojable · Sin dependencia del proveedor", fr: "Open source · Auto-hébergé · Pas de dépendance fournisseur", de: "Open Source · Selbst-hostbar · Kein Vendor Lock-in", ja: "オープンソース · セルフホスト可能 · ベンダーロックインなし", zh: "开源 · 可自托管 · 无供应商锁定", pt: "Código aberto · Auto-hospedável · Sem dependência de fornecedor", ko: "오픈 소스 · 자체 호스팅 · 공급업체 종속 없음" },
  heroTitle1: { en: "Write docs.", es: "Escribe docs.", fr: "Écrivez des docs.", de: "Docs schreiben.", ja: "ドキュメントを書こう。", zh: "写文档。", pt: "Escreva docs.", ko: "문서를 작성하세요." },
  heroTitle2: { en: "Not infrastructure", es: "No infraestructura", fr: "Pas d'infrastructure", de: "Keine Infrastruktur", ja: "インフラではなく", zh: "不是基础设施", pt: "Não infraestrutura", ko: "인프라가 아닌" },
  heroSub: { en: "Quirex is a documentation platform that ships as a single static site. Markdown in, beautiful docs out. No databases, no deploys, no drama.", es: "Quirex es una plataforma de documentación que funciona como un sitio estático. Markdown dentro, docs hermosos fuera. Sin bases de datos, sin deploys, sin drama.", fr: "Quirex est une plateforme de documentation sous forme de site statique. Du Markdown en entrée, de beaux docs en sortie. Pas de bases de données, pas de déploiements, pas de drame.", de: "Quirex ist eine Dokumentationsplattform als statische Website. Markdown rein, schöne Docs raus. Keine Datenbanken, keine Deploys, kein Drama.", ja: "Quirexは静的サイトとして出荷されるドキュメントプラットフォームです。Markdownを入力、美しいドキュメントを出力。データベース不要、デプロイ不要、面倒なし。", zh: "Quirex是一个以静态站点形式交付的文档平台。输入Markdown，输出精美文档。无需数据库、无需部署、无需烦恼。", pt: "Quirex é uma plataforma de documentação que funciona como um site estático. Markdown entra, docs bonitos saem. Sem bancos de dados, sem deploys, sem drama.", ko: "Quirex은 단일 정적 사이트로 제공되는 문서 플랫폼입니다. Markdown 입력, 아름다운 문서 출력. 데이터베이스 없음, 배포 없음, 드라마 없음." },
  getStarted: { en: "Get started", es: "Comenzar", fr: "Commencer", de: "Loslegen", ja: "始める", zh: "开始使用", pt: "Começar", ko: "시작하기" },
  tryEditor: { en: "Try the editor", es: "Probar el editor", fr: "Essayer l'éditeur", de: "Editor ausprobieren", ja: "エディタを試す", zh: "试用编辑器", pt: "Experimentar o editor", ko: "에디터 사용해보기" },

  // Stats
  statsLangs: { en: "Languages highlighted", es: "Idiomas resaltados", fr: "Langages colorés", de: "Sprachen hervorgehoben", ja: "ハイライト対応言語", zh: "支持高亮的语言", pt: "Linguagens destacadas", ko: "하이라이트 언어" },
  statsBuild: { en: "Build config needed", es: "Config de build necesaria", fr: "Config de build requise", de: "Build-Konfiguration nötig", ja: "ビルド設定不要", zh: "需要构建配置", pt: "Config de build necessária", ko: "빌드 설정 필요" },
  statsRevisions: { en: "Revisions per post", es: "Revisiones por post", fr: "Révisions par article", de: "Revisionen pro Beitrag", ja: "投稿ごとのリビジョン", zh: "每篇文章的修订版", pt: "Revisões por post", ko: "게시물당 리비전" },
  statsComponents: { en: "Custom components", es: "Componentes personalizados", fr: "Composants personnalisés", de: "Eigene Komponenten", ja: "カスタムコンポーネント", zh: "自定义组件", pt: "Componentes personalizados", ko: "커스텀 컴포넌트" },

  // Features section
  platformLabel: { en: "Platform", es: "Plataforma", fr: "Plateforme", de: "Plattform", ja: "プラットフォーム", zh: "平台", pt: "Plataforma", ko: "플랫폼" },
  featuresTitle1: { en: "Everything you need.", es: "Todo lo que necesitas.", fr: "Tout ce qu'il vous faut.", de: "Alles was Sie brauchen.", ja: "必要なものすべて。", zh: "您需要的一切。", pt: "Tudo o que você precisa.", ko: "필요한 모든 것." },
  featuresTitle2: { en: "Nothing you don't.", es: "Nada que no.", fr: "Rien de superflu.", de: "Nichts was nicht.", ja: "不要なものなし。", zh: "没有多余的。", pt: "Nada que não.", ko: "불필요한 건 없이." },
  featuresSub: { en: "No plugins to install, no YAML to wrestle, no build step to debug. Just write markdown and ship.", es: "Sin plugins, sin YAML, sin pasos de build. Solo escribe markdown y publica.", fr: "Pas de plugins, pas de YAML, pas d'étape de build. Écrivez en markdown et publiez.", de: "Keine Plugins, kein YAML, kein Build-Schritt. Einfach Markdown schreiben und veröffentlichen.", ja: "プラグイン不要、YAML不要、ビルドステップ不要。Markdownを書いて公開するだけ。", zh: "无需安装插件，无需编写YAML，无需调试构建步骤。只需编写markdown并发布。", pt: "Sem plugins, sem YAML, sem etapa de build. Apenas escreva markdown e publique.", ko: "플러그인 설치 없음, YAML 없음, 빌드 단계 없음. 마크다운을 작성하고 배포하세요." },

  // Feature cards
  fMarkdownNative: { en: "Markdown-native", es: "Nativo en Markdown", fr: "Natif Markdown", de: "Markdown-nativ", ja: "Markdownネイティブ", zh: "Markdown原生", pt: "Nativo em Markdown", ko: "Markdown 네이티브" },
  fMarkdownDesc: { en: "GFM, syntax highlighting, callouts, collapsible sections. Write docs — not config files.", es: "GFM, resaltado de sintaxis, callouts, secciones plegables. Escribe docs — no archivos de configuración.", fr: "GFM, coloration syntaxique, callouts, sections pliables. Écrivez des docs — pas des fichiers de config.", de: "GFM, Syntax-Highlighting, Callouts, klappbare Abschnitte. Docs schreiben — nicht Config-Dateien.", ja: "GFM、シンタックスハイライト、コールアウト、折りたたみセクション。設定ファイルではなくドキュメントを書きましょう。", zh: "GFM、语法高亮、标注、可折叠部分。写文档——不是配置文件。", pt: "GFM, destaque de sintaxe, callouts, seções recolhíveis. Escreva docs — não arquivos de config.", ko: "GFM, 구문 강조, 콜아웃, 접이식 섹션. 설정 파일이 아닌 문서를 작성하세요." },
  fSearch: { en: "Instant search", es: "Búsqueda instantánea", fr: "Recherche instantanée", de: "Sofortsuche", ja: "インスタント検索", zh: "即时搜索", pt: "Busca instantânea", ko: "즉시 검색" },
  fSearchDesc: { en: "⌘K to find anything instantly. Fuzzy matching across every title, tag, and paragraph.", es: "⌘K para encontrar todo al instante. Coincidencia difusa en títulos, etiquetas y párrafos.", fr: "⌘K pour tout trouver instantanément. Correspondance floue dans chaque titre, tag et paragraphe.", de: "⌘K um sofort alles zu finden. Fuzzy-Suche über Titel, Tags und Absätze.", ja: "⌘Kですべてを即座に検索。タイトル、タグ、段落全体のファジーマッチング。", zh: "⌘K即时查找任何内容。跨标题、标签和段落的模糊匹配。", pt: "⌘K para encontrar tudo instantaneamente. Correspondência fuzzy em títulos, tags e parágrafos.", ko: "⌘K로 즉시 검색. 모든 제목, 태그, 단락에 걸친 퍼지 매칭." },
  fDarkMode: { en: "Dark mode", es: "Modo oscuro", fr: "Mode sombre", de: "Dunkelmodus", ja: "ダークモード", zh: "暗色模式", pt: "Modo escuro", ko: "다크 모드" },
  fDarkModeDesc: { en: "System-aware theming with palettes tuned for readability. Zero flash on load.", es: "Temas que detectan el sistema con paletas optimizadas para legibilidad. Sin parpadeos al cargar.", fr: "Thèmes adaptatifs avec palettes optimisées pour la lisibilité. Zéro flash au chargement.", de: "System-bewusstes Theming mit lesefreundlichen Paletten. Kein Blitz beim Laden.", ja: "読みやすさに調整されたパレットでシステム対応テーマ。ロード時のフラッシュなし。", zh: "系统感知主题，调色板经过可读性调优。加载时零闪烁。", pt: "Temas que detectam o sistema com paletas otimizadas para legibilidade. Sem flash no carregamento.", ko: "가독성에 최적화된 팔레트로 시스템 인식 테마. 로드 시 플래시 없음." },
  fEditor: { en: "Editor built for speed", es: "Editor hecho para velocidad", fr: "Éditeur conçu pour la vitesse", de: "Editor für Geschwindigkeit gebaut", ja: "速度重視のエディタ", zh: "为速度而生的编辑器", pt: "Editor feito para velocidade", ko: "속도를 위해 만들어진 에디터" },
  fEditorDesc: { en: "Formatting toolbar, ⌘B/⌘I/⌘K shortcuts, undo stack, auto-list continuation.", es: "Barra de formato, atajos ⌘B/⌘I/⌘K, pila de deshacer, continuación automática de listas.", fr: "Barre d'outils de formatage, raccourcis ⌘B/⌘I/⌘K, pile d'annulation, continuation auto des listes.", de: "Formatierungsleiste, ⌘B/⌘I/⌘K Shortcuts, Undo-Stack, automatische Listenfortsetzung.", ja: "フォーマットツールバー、⌘B/⌘I/⌘Kショートカット、元に戻すスタック、リスト自動継続。", zh: "格式工具栏，⌘B/⌘I/⌘K快捷键，撤销栈，自动列表续接。", pt: "Barra de formatação, atalhos ⌘B/⌘I/⌘K, pilha de desfazer, continuação automática de listas.", ko: "서식 도구 모음, ⌘B/⌘I/⌘K 단축키, 실행 취소 스택, 자동 목록 연속." },
  fImport: { en: "Drag-and-drop import", es: "Importar arrastrando", fr: "Importation glisser-déposer", de: "Drag-and-Drop-Import", ja: "ドラッグ＆ドロップインポート", zh: "拖放导入", pt: "Importar arrastando", ko: "드래그 앤 드롭 가져오기" },
  fImportDesc: { en: "Drop .md files with frontmatter. Bulk-import an entire docs folder in seconds.", es: "Suelta archivos .md con frontmatter. Importa masivamente una carpeta completa en segundos.", fr: "Déposez des fichiers .md avec frontmatter. Importation en masse d'un dossier complet en secondes.", de: "Ziehen Sie .md-Dateien mit Frontmatter. Massenimport eines kompletten Ordners in Sekunden.", ja: ".mdファイルをフロントマター付きでドロップ。フォルダ全体を数秒で一括インポート。", zh: "拖放带有frontmatter的.md文件。数秒内批量导入整个文档文件夹。", pt: "Solte arquivos .md com frontmatter. Importe em massa uma pasta inteira em segundos.", ko: "프론트매터가 포함된 .md 파일을 드롭하세요. 전체 문서 폴더를 몇 초 만에 일괄 가져오기." },
  fStructure: { en: "Deep structure", es: "Estructura profunda", fr: "Structure profonde", de: "Tiefe Struktur", ja: "深い構造", zh: "深层结构", pt: "Estrutura profunda", ko: "깊은 구조" },
  fStructureDesc: { en: "Categories, tags, sidebar nav, table of contents, breadcrumbs. Information architecture built in.", es: "Categorías, etiquetas, barra lateral, tabla de contenidos, migas de pan. Arquitectura de información incluida.", fr: "Catégories, tags, navigation latérale, table des matières, fil d'Ariane. Architecture d'information intégrée.", de: "Kategorien, Tags, Seitenleiste, Inhaltsverzeichnis, Breadcrumbs. Informationsarchitektur integriert.", ja: "カテゴリ、タグ、サイドバーナビ、目次、パンくずリスト。情報アーキテクチャを内蔵。", zh: "分类、标签、侧边栏导航、目录、面包屑。内置信息架构。", pt: "Categorias, tags, nav lateral, sumário, breadcrumbs. Arquitetura de informação integrada.", ko: "카테고리, 태그, 사이드바 탐색, 목차, 브레드크럼. 기본 내장 정보 아키텍처." },
  fRevisions: { en: "Revision history", es: "Historial de revisiones", fr: "Historique des révisions", de: "Revisionshistorie", ja: "リビジョン履歴", zh: "修订历史", pt: "Histórico de revisões", ko: "리비전 기록" },
  fRevisionsDesc: { en: "Every save creates a snapshot. Line-by-line diffs. One-click restore to any version.", es: "Cada guardado crea un snapshot. Diffs línea por línea. Restauración con un clic.", fr: "Chaque sauvegarde crée un snapshot. Diffs ligne par ligne. Restauration en un clic.", de: "Jedes Speichern erstellt einen Snapshot. Zeilenweise Diffs. Ein-Klick-Wiederherstellung.", ja: "保存するたびにスナップショットを作成。行ごとの差分。ワンクリック復元。", zh: "每次保存都会创建快照。逐行差异比较。一键恢复到任何版本。", pt: "Cada salvamento cria um snapshot. Diffs linha por linha. Restauração com um clique.", ko: "저장할 때마다 스냅샷 생성. 줄 단위 비교. 원클릭 복원." },
  fPWA: { en: "PWA & offline", es: "PWA y offline", fr: "PWA et hors-ligne", de: "PWA & Offline", ja: "PWA & オフライン", zh: "PWA和离线", pt: "PWA e offline", ko: "PWA 및 오프라인" },
  fPWADesc: { en: "Service worker caching, installable app. Your docs work even without a connection.", es: "Caché con service worker, app instalable. Tus docs funcionan sin conexión.", fr: "Cache service worker, app installable. Vos docs fonctionnent même hors connexion.", de: "Service Worker Caching, installierbare App. Docs funktionieren auch offline.", ja: "Service Workerキャッシュ、インストール可能なアプリ。接続なしでもドキュメントが使えます。", zh: "Service Worker缓存，可安装应用。即使没有连接，您的文档也能工作。", pt: "Cache com service worker, app instalável. Seus docs funcionam sem conexão.", ko: "서비스 워커 캐싱, 설치 가능한 앱. 연결 없이도 문서가 작동합니다." },
  fNoBackend: { en: "Zero backend required", es: "Sin backend necesario", fr: "Aucun backend requis", de: "Kein Backend nötig", ja: "バックエンド不要", zh: "无需后端", pt: "Sem backend necessário", ko: "백엔드 불필요" },
  fNoBackendDesc: { en: "Runs entirely client-side. Deploy to any static host. Bring your own API when ready.", es: "Funciona completamente en el cliente. Despliega en cualquier host estático. Trae tu API cuando quieras.", fr: "Fonctionne entièrement côté client. Déployez sur n'importe quel hôte statique. Ajoutez votre API quand vous voulez.", de: "Läuft komplett clientseitig. Deploy auf jeden statischen Host. Bringen Sie Ihre eigene API mit.", ja: "完全にクライアントサイドで動作。任意の静的ホストにデプロイ。準備ができたらAPIを接続。", zh: "完全在客户端运行。部署到任何静态主机。准备好后接入您自己的API。", pt: "Funciona inteiramente no cliente. Faça deploy em qualquer host estático. Conecte sua API quando quiser.", ko: "완전히 클라이언트 사이드로 실행. 모든 정적 호스트에 배포. 준비되면 자체 API 연결." },

  // Editor section
  editorLabel: { en: "Editor", es: "Editor", fr: "Éditeur", de: "Editor", ja: "エディタ", zh: "编辑器", pt: "Editor", ko: "에디터" },
  editorTitle: { en: "An editor you'll actually enjoy using", es: "Un editor que realmente disfrutarás usar", fr: "Un éditeur que vous apprécierez vraiment", de: "Ein Editor, den Sie gerne benutzen werden", ja: "本当に使いたくなるエディタ", zh: "一个你真正会喜欢使用的编辑器", pt: "Um editor que você realmente vai gostar de usar", ko: "실제로 즐겁게 사용할 에디터" },
  editorDesc: { en: "Not a glorified textarea. A real editing experience with formatting shortcuts, live preview, revision history, and bulk import — all running locally in your browser.", es: "No es un textarea glorificado. Una experiencia de edición real con atajos de formato, vista previa en vivo, historial de revisiones e importación masiva — todo localmente en tu navegador.", fr: "Pas un simple textarea. Une vraie expérience d'édition avec raccourcis de formatage, aperçu en direct, historique des révisions et import en masse — tout dans votre navigateur.", de: "Kein aufgemöbeltes Textarea. Echte Bearbeitungserfahrung mit Formatierungsshortcuts, Live-Vorschau, Revisionshistorie und Massenimport — alles lokal im Browser.", ja: "ただのテキストエリアではありません。フォーマットショートカット、ライブプレビュー、リビジョン履歴、一括インポート — すべてブラウザでローカルに動作する本物の編集体験。", zh: "不是美化的文本框。带有格式快捷键、实时预览、修订历史和批量导入的真正编辑体验——全部在浏览器中本地运行。", pt: "Não é um textarea glorificado. Uma experiência real de edição com atalhos de formatação, pré-visualização ao vivo, histórico de revisões e importação em massa — tudo rodando localmente no seu navegador.", ko: "단순한 텍스트 영역이 아닙니다. 서식 단축키, 실시간 미리보기, 리비전 기록, 일괄 가져오기를 갖춘 진정한 편집 경험 — 모두 브라우저에서 로컬로 실행." },
  tryItNow: { en: "Try it now", es: "Pruébalo ahora", fr: "Essayez maintenant", de: "Jetzt ausprobieren", ja: "今すぐ試す", zh: "立即试用", pt: "Experimente agora", ko: "지금 사용해보기" },

  // Keyboard shortcuts section
  keyboardTitle: { en: "Keyboard-first navigation", es: "Navegación con teclado", fr: "Navigation au clavier", de: "Tastatur-Navigation", ja: "キーボードファーストのナビゲーション", zh: "键盘优先导航", pt: "Navegação por teclado", ko: "키보드 우선 탐색" },
  keyboardDesc: { en: "Every action has a shortcut. Navigate docs, search, format text, and manage content without touching the mouse.", es: "Cada acción tiene un atajo. Navega, busca, formatea y gestiona contenido sin tocar el ratón.", fr: "Chaque action a un raccourci. Naviguez, recherchez, formatez et gérez le contenu sans toucher la souris.", de: "Jede Aktion hat einen Shortcut. Navigieren, suchen, formatieren und verwalten Sie Inhalte ohne Maus.", ja: "すべてのアクションにショートカットがあります。マウスに触れずにドキュメントをナビゲート、検索、テキストの書式設定、コンテンツ管理が可能。", zh: "每个操作都有快捷键。无需鼠标即可导航、搜索、格式化文本和管理内容。", pt: "Cada ação tem um atalho. Navegue, busque, formate e gerencie conteúdo sem tocar no mouse.", ko: "모든 작업에 단축키가 있습니다. 마우스 없이 문서 탐색, 검색, 텍스트 서식, 콘텐츠 관리." },

  // Demo section
  demoLabel: { en: "Try it live", es: "Pruébalo en vivo", fr: "Essayez en direct", de: "Live ausprobieren", ja: "ライブで試す", zh: "在线试用", pt: "Experimente ao vivo", ko: "라이브로 사용해보기" },
  demoTitle1: { en: "See it in action.", es: "Míralo en acción.", fr: "Voyez-le en action.", de: "Sehen Sie es in Aktion.", ja: "実際に動作を確認。", zh: "看看实际效果。", pt: "Veja em ação.", ko: "실제 동작을 확인하세요." },
  demoTitle2: { en: "Right here, right now.", es: "Aquí y ahora.", fr: "Ici et maintenant.", de: "Hier und jetzt.", ja: "今すぐ、ここで。", zh: "就在这里，就是现在。", pt: "Aqui e agora.", ko: "지금 바로 여기서." },
  demoDesc: { en: "Edit the markdown on the left and watch it render instantly on the right. No setup needed.", es: "Edita el markdown a la izquierda y mira cómo se renderiza al instante a la derecha. Sin configuración.", fr: "Modifiez le markdown à gauche et regardez-le se rendre instantanément à droite. Aucune configuration.", de: "Bearbeiten Sie das Markdown links und sehen Sie die Vorschau rechts sofort. Keine Einrichtung nötig.", ja: "左側でMarkdownを編集し、右側で即座にレンダリングを確認。セットアップ不要。", zh: "在左侧编辑markdown，在右侧即时查看渲染效果。无需设置。", pt: "Edite o markdown à esquerda e veja renderizar instantaneamente à direita. Sem configuração.", ko: "왼쪽에서 마크다운을 편집하고 오른쪽에서 즉시 렌더링을 확인하세요. 설정 불필요." },

  // Testimonials
  lovedByDevs: { en: "Loved by developers", es: "Amado por desarrolladores", fr: "Adoré par les développeurs", de: "Von Entwicklern geliebt", ja: "開発者に愛されている", zh: "深受开发者喜爱", pt: "Amado por desenvolvedores", ko: "개발자들에게 사랑받는" },
  whoShip: { en: "who ship.", es: "que publican.", fr: "qui livrent.", de: "die liefern.", ja: "成果を出す。", zh: "快速交付的。", pt: "que entregam.", ko: "빠르게 배포하는." },

  // Comparison
  comparisonLabel: { en: "Comparison", es: "Comparación", fr: "Comparaison", de: "Vergleich", ja: "比較", zh: "对比", pt: "Comparação", ko: "비교" },
  comparisonTitle: { en: "How Quirex compares.", es: "Cómo se compara Quirex.", fr: "Comment Quirex se compare.", de: "Wie Quirex abschneidet.", ja: "Quirexの比較。", zh: "Quirex对比其他平台。", pt: "Como o Quirex se compara.", ko: "Quirex 비교." },
  comparisonDesc: { en: "A transparent look at what you get with each platform. No asterisks.", es: "Una mirada transparente a lo que obtienes con cada plataforma. Sin asteriscos.", fr: "Un regard transparent sur ce que vous obtenez avec chaque plateforme. Sans astérisques.", de: "Ein transparenter Blick auf das, was jede Plattform bietet. Ohne Sternchen.", ja: "各プラットフォームで得られるものの透明な比較。注釈なし。", zh: "透明地展示每个平台提供的功能。没有星号。", pt: "Uma visão transparente do que você obtém com cada plataforma. Sem asteriscos.", ko: "각 플랫폼에서 얻을 수 있는 것에 대한 투명한 비교. 별표 없음." },

  // CTA
  ctaTitle: { en: "Ready to write something beautiful?", es: "¿Listo para escribir algo hermoso?", fr: "Prêt à écrire quelque chose de beau ?", de: "Bereit, etwas Schönes zu schreiben?", ja: "美しいものを書く準備はできましたか？", zh: "准备好写点精彩的了吗？", pt: "Pronto para escrever algo bonito?", ko: "아름다운 것을 쓸 준비가 되셨나요?" },
  ctaSub: { en: "Fork it. Customize it. Deploy it. Your docs, your way.", es: "Hazle fork. Personalízalo. Despliégalo. Tus docs, a tu manera.", fr: "Forkez-le. Personnalisez-le. Déployez-le. Vos docs, à votre façon.", de: "Forken. Anpassen. Deployen. Ihre Docs, Ihr Weg.", ja: "フォークして、カスタマイズして、デプロイ。あなたのドキュメント、あなたのやり方で。", zh: "Fork它。自定义它。部署它。你的文档，你的方式。", pt: "Faça fork. Personalize. Faça deploy. Seus docs, do seu jeito.", ko: "포크하세요. 커스터마이즈하세요. 배포하세요. 당신의 문서, 당신의 방식." },
  readTheDocs: { en: "Read the docs", es: "Leer los docs", fr: "Lire les docs", de: "Docs lesen", ja: "ドキュメントを読む", zh: "阅读文档", pt: "Ler os docs", ko: "문서 읽기" },
  viewOnGithub: { en: "View on GitHub", es: "Ver en GitHub", fr: "Voir sur GitHub", de: "Auf GitHub ansehen", ja: "GitHubで見る", zh: "在GitHub上查看", pt: "Ver no GitHub", ko: "GitHub에서 보기" },

  // Header
  signIn: { en: "Sign in", es: "Iniciar sesión", fr: "Se connecter", de: "Anmelden", ja: "サインイン", zh: "登录", pt: "Entrar", ko: "로그인" },
  signOut: { en: "Sign out", es: "Cerrar sesión", fr: "Se déconnecter", de: "Abmelden", ja: "サインアウト", zh: "退出登录", pt: "Sair", ko: "로그아웃" },
  manageUsers: { en: "Manage Users", es: "Gestionar usuarios", fr: "Gérer les utilisateurs", de: "Benutzer verwalten", ja: "ユーザー管理", zh: "管理用户", pt: "Gerenciar usuários", ko: "사용자 관리" },
  bookmarksHistory: { en: "Bookmarks & History", es: "Marcadores e historial", fr: "Favoris et historique", de: "Lesezeichen & Verlauf", ja: "ブックマークと履歴", zh: "书签和历史记录", pt: "Favoritos e histórico", ko: "북마크 및 기록" },
  onThisPage: { en: "On this page", es: "En esta página", fr: "Sur cette page", de: "Auf dieser Seite", ja: "このページの内容", zh: "本页内容", pt: "Nesta página", ko: "이 페이지에서" },
  swipeNav: { en: "Swipe ← → to navigate between docs", es: "Desliza ← → para navegar entre docs", fr: "Glissez ← → pour naviguer entre les docs", de: "Wischen ← → um zwischen Docs zu navigieren", ja: "← → スワイプでドキュメント間を移動", zh: "左右滑动以在文档之间导航", pt: "Deslize ← → para navegar entre docs", ko: "← → 스와이프하여 문서 간 탐색" },

  // Comparison table features
  cfZeroConfig: { en: "Zero config setup", es: "Configuración cero", fr: "Zéro configuration", de: "Null-Konfiguration", ja: "設定不要", zh: "零配置", pt: "Configuração zero", ko: "설정 불필요" },
  cfMarkdownNative: { en: "Markdown-native", es: "Nativo en Markdown", fr: "Natif Markdown", de: "Markdown-nativ", ja: "Markdownネイティブ", zh: "Markdown原生", pt: "Nativo em Markdown", ko: "Markdown 네이티브" },
  cfSelfHostable: { en: "Self-hostable", es: "Auto-alojable", fr: "Auto-hébergeable", de: "Selbst-hostbar", ja: "セルフホスト可能", zh: "可自托管", pt: "Auto-hospedável", ko: "자체 호스팅" },
  cfNoLockIn: { en: "No vendor lock-in", es: "Sin dependencia del proveedor", fr: "Pas de dépendance fournisseur", de: "Kein Vendor Lock-in", ja: "ベンダーロックインなし", zh: "无供应商锁定", pt: "Sem dependência de fornecedor", ko: "공급업체 종속 없음" },
  cfBuiltInSearch: { en: "Built-in search", es: "Búsqueda integrada", fr: "Recherche intégrée", de: "Integrierte Suche", ja: "組み込み検索", zh: "内置搜索", pt: "Busca integrada", ko: "내장 검색" },
  cfDarkMode: { en: "Dark mode", es: "Modo oscuro", fr: "Mode sombre", de: "Dunkelmodus", ja: "ダークモード", zh: "暗色模式", pt: "Modo escuro", ko: "다크 모드" },
  cfRevisionHistory: { en: "Revision history", es: "Historial de revisiones", fr: "Historique des révisions", de: "Revisionshistorie", ja: "リビジョン履歴", zh: "修订历史", pt: "Histórico de revisões", ko: "리비전 기록" },
  cfOffline: { en: "Offline support (PWA)", es: "Soporte offline (PWA)", fr: "Support hors-ligne (PWA)", de: "Offline-Support (PWA)", ja: "オフラインサポート (PWA)", zh: "离线支持 (PWA)", pt: "Suporte offline (PWA)", ko: "오프라인 지원 (PWA)" },
  cfCallouts: { en: "Custom callout blocks", es: "Bloques de callout personalizados", fr: "Blocs callout personnalisés", de: "Eigene Callout-Blöcke", ja: "カスタムコールアウトブロック", zh: "自定义标注块", pt: "Blocos de callout personalizados", ko: "커스텀 콜아웃 블록" },
  cfShortcuts: { en: "Keyboard shortcuts", es: "Atajos de teclado", fr: "Raccourcis clavier", de: "Tastaturkürzel", ja: "キーボードショートカット", zh: "键盘快捷键", pt: "Atalhos de teclado", ko: "키보드 단축키" },
  cfFree: { en: "Free forever", es: "Gratis para siempre", fr: "Gratuit pour toujours", de: "Für immer kostenlos", ja: "永久無料", zh: "永久免费", pt: "Grátis para sempre", ko: "영구 무료" },
  cfNoBuild: { en: "No build step required", es: "Sin paso de build", fr: "Pas d'étape de build", de: "Kein Build-Schritt", ja: "ビルドステップ不要", zh: "无需构建步骤", pt: "Sem etapa de build", ko: "빌드 단계 불필요" },
  cfOpenSource: { en: "Open source", es: "Código abierto", fr: "Open source", de: "Open Source", ja: "オープンソース", zh: "开源", pt: "Código aberto", ko: "오픈 소스" },
  featureCol: { en: "Feature", es: "Característica", fr: "Fonctionnalité", de: "Funktion", ja: "機能", zh: "功能", pt: "Funcionalidade", ko: "기능" },
};

export function t(key: string, lang: LangCode): string {
  return uiStrings[key]?.[lang] || uiStrings[key]?.en || key;
}
