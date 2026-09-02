/* ═══════════════════════════════════════════
   WYT — SCRIPT.JS
   Arabic/English i18n + All interactions
═══════════════════════════════════════════ */

/* ══════════════════════
   TRANSLATIONS
══════════════════════ */
const translations = {
  en: {
    'nav-about':'About','nav-machines':'Machines','nav-products':'Products',
    'nav-host':'Host a Machine','nav-collab':'Collaborate','nav-faq':'FAQ',
    'nav-contact':'Contact','nav-cta':'Request a Machine',
    'hero-tag':'Smart Vending · Egypt',
    'hero-title':'Vending that actually <em>works.</em>',
    'hero-sub':'WYT brings sleek, cashless, always-stocked vending machines to offices, gyms, hospitals and schools — with zero hassle on your end.',
    'hero-btn1':'Host a Machine — Free','hero-btn2':'See Our Machines',
    'stat-machines':'Machines Deployed','stat-locations':'Partner Locations','stat-uptime':'Uptime',
    'about-tag':'Who We Are','about-title':'We\'re not just a vending company.',
    'about-p1':'WYT was built on a simple idea — people deserve better than stale snacks from a dusty machine. We set out to design a vending experience that\'s smart, fresh, and genuinely enjoyable.',
    'about-p2':'Today we operate across hundreds of locations in Egypt, powered by cashless payments, real-time inventory tracking, and premium products curated for every kind of space.',
    'p1-title':'Zero Hassle','p1-desc':'We install, restock and maintain everything.',
    'p2-title':'Smart Technology','p2-desc':'Cashless, connected, monitored 24/7.',
    'p3-title':'Fresh Products','p3-desc':'Premium brands updated by demand data.',
    'p4-title':'True Partnership','p4-desc':'Your space, our machine — you earn too.',
    'about-badge':'Smart Vending in Egypt',
    'machines-tag':'Our Lineup','machines-title':'A machine for every space','machines-sub':'Click any model to see full specifications.',
    'badge-bestseller':'Best Seller','badge-new':'New','view-specs':'View Specs →',
    'm1-name':'WYT Pro 500','m1-desc':'Full-size combo — snacks & chilled drinks',
    'm2-name':'WYT Brew Station','m2-desc':'Bean-to-cup coffee & hot drinks',
    'm3-name':'WYT Fresh','m3-desc':'Refrigerated meals, salads & fresh produce',
    'm4-name':'WYT Compact','m4-desc':'Slim snack machine for smaller venues',
    'modal-cta':'Request This Machine →',
    'products-tag':'What We Stock','products-title':'Something for everyone','products-sub':'Curated to satisfy every craving and dietary need.',
    'prod1-title':'Snacks & Sweets','prod1-desc':'Chips, chocolates, biscuits and classics from top brands.',
    'prod2-title':'Cold Beverages','prod2-desc':'Sodas, water, energy drinks and sports drinks — chilled.',
    'prod3-title':'Healthy Options','prod3-desc':'Protein bars, nuts, salads, fruit and low-calorie picks.',
    'prod4-title':'Hot Beverages','prod4-desc':'Fresh espresso, cappuccino, latte, hot chocolate and teas.',
    'host-tag':'For Your Business','host-title':'Host a WYT Machine — Free',
    'host-sub':'We supply, install, restock and maintain everything. You provide the space and earn a share of every sale.',
    'perk1-t':'Zero Upfront Cost','perk1-d':'No purchase, no lease, no risk.',
    'perk2-t':'Revenue Sharing','perk2-d':'You earn a commission on every sale.',
    'perk3-t':'Full Maintenance','perk3-d':'We handle all repairs and restocking.',
    'perk4-t':'Custom Branding','perk4-d':'Wrap the machine with your logo.',
    'host-cta':'Apply to Host →',
    'v1-t':'Corporate Offices','v1-d':'Keep your team fuelled all day',
    'v2-t':'Gyms & Fitness','v2-d':'Protein & electrolytes on demand',
    'v3-t':'Hospitals','v3-d':'24/7 access for staff & visitors',
    'v4-t':'Universities','v4-d':'Healthy options all day',
    'v5-t':'Hotels','v5-d':'Elevate guest experience',
    'v6-t':'Factories','v6-d':'Sustain productivity on shifts',
    'collab-tag':'Partnerships','collab-title':'Let\'s collaborate','collab-sub':'Open to brands, distributors, investors and entrepreneurs.',
    'c1-t':'Brand Partnership','c1-d':'Get your product stocked in WYT machines across Egypt and reach thousands of customers daily.','c1-cta':'Partner With Us',
    'c2-t':'Distribution & Franchise','c2-d':'Want to bring WYT to your city? We offer franchise models for entrepreneurs building a vending business.','c2-cta':'Explore This',
    'c3-t':'Tech & Integration','c3-d':'Tech company, payment provider or app developer? Let\'s integrate and make vending smarter together.','c3-cta':'Let\'s Build',
    'loc-tag':'Our Machines in the Wild','loc-title':'Trusted across Egypt',
    'loc-sub':'Our machines are live at these locations — add yours to the map.',
    'loc-type1':'Corporate Office','loc-name1':'Orascom HQ, Cairo','loc-desc1':'WYT Pro 500 · Main lobby',
    'loc-type2':'Gym','loc-name2':'GymNation, Maadi','loc-desc2':'WYT Pro 500 · Reception area',
    'loc-type3':'Hospital','loc-name3':'Maadi Medical Centre','loc-desc3':'WYT Fresh · Staff corridor',
    'loc-type4':'University','loc-name4':'AUC Campus, New Cairo','loc-desc4':'WYT Compact · Student hub',
    'loc-type5':'Hotel','loc-name5':'Hilton Cairo, Zamalek','loc-desc5':'WYT Brew · Guest floor',
    'loc-type6':'Factory','loc-name6':'Elsewedy Electric, 6th Oct','loc-desc6':'WYT Pro 500 · Break room',
    'loc-cta-title':'Want to see your space here?','loc-cta-sub':'Join 120+ locations across Egypt. It\'s completely free.',
    'loc-cta-btn':'Add Your Location →',
    'testi-tag':'Reviews','testi-title':'Trusted by leading organisations',
    'r1-name':'Sara Khalil','r1-role':'HR Director, Orascom','r1-text':'"Our employees love the WYT machine. Always stocked, accepts Apple Pay, and the healthy options are genuinely good."',
    'r2-name':'Ahmed Mahmoud','r2-role':'Facilities Manager, GymNation','r2-text':'"WYT installed and disappeared — in the best way. We haven\'t had to think about it once. It just works."',
    'r3-name':'Nadia Farouk','r3-role':'Operations Head, Maadi Medical','r3-text':'"The fresh food machine in our hospital wing has been a game-changer for night-shift staff. Professional and reliable."',
    'faq-tag':'FAQ','faq-title':'Common Questions',
    'faq1-q':'Is there really no cost to host a machine?','faq1-a':'Yes — WYT covers 100% of the machine cost, installation, maintenance, and restocking. You simply provide the space and a standard power outlet.',
    'faq2-q':'How often is the machine restocked?','faq2-a':'Our smart system monitors stock in real-time and triggers a restock visit before items run out. High-traffic locations are serviced multiple times per week.',
    'faq3-q':'What payment methods do your machines accept?','faq3-a':'All WYT machines accept contactless cards (Visa, Mastercard), Apple Pay, Google Pay, Fawry, and Vodafone Cash. Cash available on select models.',
    'faq4-q':'What happens if the machine breaks down?','faq4-a':'Our remote diagnostics alert our team instantly. Most issues are resolved remotely. On-site visits happen within 24 hours if needed.',
    'faq5-q':'Can we customise what the machine stocks?','faq5-a':'Absolutely. We tailor product selection to your demographic — protein bars for gyms, fresh meals for hospitals, study snacks for universities.',
    'faq6-q':'What areas do you serve?','faq6-a':'We currently operate across Cairo, Giza, and Alexandria, with expansion plans throughout 2025–2026.',
    'faq7-q':'How do I get started?','faq7-a':'Fill in the contact form below. One of our team will reach out within 24 hours to discuss your needs.',
    'contact-tag':'Contact','contact-title':'Let\'s work together','contact-sub':'Fill in the form and our team will respond within 24 hours.',
    'ci-address':'Address','ci-phone':'WhatsApp','ci-email':'Email','ci-hours':'Working Hours','ci-hours-val':'Sun–Thu, 9AM – 5PM',
    'trust1':'100% Free to Host','trust2':'No Contracts','trust3':'24h Response',
    'f-fname':'First Name','f-fname-ph':'Ahmed','f-lname':'Last Name','f-lname-ph':'Hassan',
    'f-email':'Email','f-phone':'Phone / WhatsApp','f-phone-ph':'Enter your phone number',
    'f-interest':'I\'m interested in…','f-select':'Select an option',
    'f-opt1':'Hosting a machine (free)','f-opt2':'Brand / product partnership','f-opt3':'Distribution / franchise','f-opt4':'Tech integration','f-opt5':'Other',
    'f-msg':'Message','f-msg-ph':'Tell us about your space, goals, or any questions…',
    'f-submit':'Send Message →','f-microcopy':'Your information is private and never shared. We respond within 24 hours.',
    'f-success':'Message sent! We\'ll be in touch within 24 hours.','f-error':'Something went wrong. Please WhatsApp us directly.',
    'footer-desc':'Smart vending for modern spaces across Egypt.',
    'footer-company':'Company','footer-services':'Services','footer-contact':'Get In Touch',
    'footer-wa':'WhatsApp Us','footer-copy':'© 2025 WYT Vending Solutions. All rights reserved.',
    'footer-privacy':'Privacy','footer-terms':'Terms','wa-label':'Chat with us'
  },
  ar: {
    'nav-about':'من نحن','nav-machines':'الماكينات','nav-products':'المنتجات',
    'nav-host':'استضف ماكينة','nav-collab':'تعاون معنا','nav-faq':'الأسئلة الشائعة',
    'nav-contact':'تواصل معنا','nav-cta':'اطلب ماكينة',
    'hero-tag':'بيع ذكي · مصر',
    'hero-title':'ماكينات بيع تعمل <em>فعلاً.</em>',
    'hero-sub':'WYT توفر ماكينات بيع ذكية وبدون نقود لمكاتبك وصالات الجيم والمستشفيات والمدارس — بدون أي تعقيد.',
    'hero-btn1':'استضف ماكينة — مجاناً','hero-btn2':'تصفح ماكيناتنا',
    'stat-machines':'ماكينة منتشرة','stat-locations':'موقع شريك','stat-uptime':'وقت تشغيل',
    'about-tag':'من نحن','about-title':'نحن لسنا مجرد شركة ماكينات بيع.',
    'about-p1':'WYT بُنيت على فكرة بسيطة — الناس تستحق أكثر من وجبات خفيفة قديمة من ماكينة مهجورة. خرجنا لنصمم تجربة بيع ذكية وطازجة وممتعة حقاً.',
    'about-p2':'اليوم نعمل في مئات المواقع بمصر، مدعومين بالدفع الإلكتروني وتتبع المخزون الفوري ومنتجات مختارة لكل نوع من البيئات.',
    'p1-title':'بدون تعقيد','p1-desc':'نحن نثبت ونعيد التخزين ونصون كل شيء.',
    'p2-title':'تقنية ذكية','p2-desc':'دفع إلكتروني، متصلة، مراقبة 24/7.',
    'p3-title':'منتجات طازجة','p3-desc':'علامات تجارية مميزة تُحدَّث حسب الطلب.',
    'p4-title':'شراكة حقيقية','p4-desc':'مساحتك، ماكينتنا — تربح أنت أيضاً.',
    'about-badge':'رقم 1 في البيع الذكي بمصر',
    'machines-tag':'خطنا التشغيلي','machines-title':'ماكينة لكل مكان','machines-sub':'اضغط على أي موديل لرؤية المواصفات الكاملة.',
    'badge-bestseller':'الأكثر مبيعاً','badge-new':'جديد','view-specs':'عرض المواصفات ←',
    'm1-name':'WYT Pro 500','m1-desc':'ماكينة كاملة — وجبات خفيفة ومشروبات مبردة',
    'm2-name':'WYT Brew Station','m2-desc':'قهوة طازجة ومشروبات ساخنة',
    'm3-name':'WYT Fresh','m3-desc':'وجبات مبردة وسلطات ومنتجات طازجة',
    'm4-name':'WYT Compact','m4-desc':'ماكينة وجبات خفيفة للأماكن الصغيرة',
    'modal-cta':'اطلب هذه الماكينة ←',
    'products-tag':'ما نوفره','products-title':'شيء للجميع','products-sub':'مختار لإرضاء كل ذوق واحتياج غذائي.',
    'prod1-title':'وجبات خفيفة وحلويات','prod1-desc':'شيبس وشوكولاتة وبسكويت من أشهر الماركات.',
    'prod2-title':'مشروبات باردة','prod2-desc':'مياه غازية وطاقة وعصائر مبردة دائماً.',
    'prod3-title':'خيارات صحية','prod3-desc':'بروتين بار ومكسرات وسلطات ومنتجات منخفضة السعرات.',
    'prod4-title':'مشروبات ساخنة','prod4-desc':'إسبريسو ولاتيه وشوكولاتة ساخنة وشاي أعشاب.',
    'host-tag':'لعملك','host-title':'استضف ماكينة WYT — مجاناً',
    'host-sub':'نحن نوفر الماكينة ونثبتها ونعيد تخزينها ونصونها. أنت توفر المساحة وتربح من كل عملية بيع.',
    'perk1-t':'بدون تكلفة مسبقة','perk1-d':'لا شراء، لا إيجار، لا مخاطرة.',
    'perk2-t':'تشارك الأرباح','perk2-d':'تحصل على عمولة من كل عملية بيع.',
    'perk3-t':'صيانة كاملة','perk3-d':'نتولى كل الإصلاحات وإعادة التخزين.',
    'perk4-t':'علامة تجارية مخصصة','perk4-d':'غلّف الماكينة بشعارك.',
    'host-cta':'تقدم للاستضافة ←',
    'v1-t':'مكاتب الشركات','v1-d':'أبق فريقك بطاقة طوال اليوم',
    'v2-t':'الجيم والرياضة','v2-d':'بروتين وإلكتروليت عند الطلب',
    'v3-t':'المستشفيات','v3-d':'متاحة 24/7 للموظفين والزوار',
    'v4-t':'الجامعات','v4-d':'خيارات صحية طوال اليوم',
    'v5-t':'الفنادق','v5-d':'ارفع تجربة الضيوف',
    'v6-t':'المصانع','v6-d':'حافظ على الإنتاجية في الورديات',
    'collab-tag':'شراكات','collab-title':'لنتعاون معاً','collab-sub':'مفتوحون للعلامات التجارية والموزعين والمستثمرين.',
    'c1-t':'شراكة علامة تجارية','c1-d':'اعرض منتجك في ماكينات WYT بمصر وتواصل مع آلاف العملاء يومياً.','c1-cta':'شارك معنا',
    'c2-t':'توزيع وفرنشايز','c2-d':'تريد إطلاق WYT في مدينتك؟ لدينا نماذج فرنشايز لرجال الأعمال.','c2-cta':'اكتشف الفرصة',
    'c3-t':'تقنية وتكامل','c3-d':'شركة تقنية أو مزود دفع؟ لنبني معاً لجعل البيع أذكى.','c3-cta':'لنبني معاً',
    'loc-tag':'Our Machines in the Wild','loc-title':'Trusted across Egypt',
    'loc-sub':'Our machines are live at these locations — add yours to the map.',
    'loc-type1':'Corporate Office','loc-name1':'Orascom HQ, Cairo','loc-desc1':'WYT Pro 500 · Main lobby',
    'loc-type2':'Gym','loc-name2':'GymNation, Maadi','loc-desc2':'WYT Pro 500 · Reception area',
    'loc-type3':'Hospital','loc-name3':'Maadi Medical Centre','loc-desc3':'WYT Fresh · Staff corridor',
    'loc-type4':'University','loc-name4':'AUC Campus, New Cairo','loc-desc4':'WYT Compact · Student hub',
    'loc-type5':'Hotel','loc-name5':'Hilton Cairo, Zamalek','loc-desc5':'WYT Brew · Guest floor',
    'loc-type6':'Factory','loc-name6':'Elsewedy Electric, 6th Oct','loc-desc6':'WYT Pro 500 · Break room',
    'loc-cta-title':'Want to see your space here?','loc-cta-sub':'Join 120+ locations across Egypt. It\'s completely free.',
    'loc-cta-btn':'Add Your Location →',
    'loc-tag':'ماكيناتنا في كل مكان','loc-title':'موثوق بنا في أنحاء مصر',
    'loc-sub':'ماكيناتنا موجودة في هذه المواقع — أضف موقعك للخريطة.',
    'loc-type1':'مكتب شركة','loc-name1':'مقر أوراسكوم، القاهرة','loc-desc1':'WYT Pro 500 · الردهة الرئيسية',
    'loc-type2':'جيم','loc-name2':'GymNation، المعادي','loc-desc2':'WYT Pro 500 · منطقة الاستقبال',
    'loc-type3':'مستشفى','loc-name3':'Maadi Medical Centre','loc-desc3':'WYT Fresh · ممر الموظفين',
    'loc-type4':'جامعة','loc-name4':'الجامعة الأمريكية، القاهرة الجديدة','loc-desc4':'WYT Compact · مركز الطلاب',
    'loc-type5':'فندق','loc-name5':'هيلتون القاهرة، الزمالك','loc-desc5':'WYT Brew · طابق الضيوف',
    'loc-type6':'مصنع','loc-name6':'السويدي إليكتريك، أكتوبر','loc-desc6':'WYT Pro 500 · غرفة الاستراحة',
    'loc-cta-title':'تريد مكانك هنا؟','loc-cta-sub':'انضم لأكثر من 120 موقع في مصر. مجاناً تماماً.',
    'loc-cta-btn':'أضف موقعك ←',
    'testi-tag':'آراء العملاء','testi-title':'موثوق به من مؤسسات رائدة',
    'r1-name':'سارة خليل','r1-role':'مدير الموارد البشرية، أوراسكوم','r1-text':'"موظفونا يحبون ماكينة WYT. دائماً ممتلئة وتقبل Apple Pay والخيارات الصحية ممتازة."',
    'r2-name':'أحمد محمود','r2-role':'مدير المنشآت، GymNation','r2-text':'"WYT ركّبت الماكينة واختفت — بأفضل طريقة. لم نضطر للتفكير فيها مرة واحدة. تعمل فقط."',
    'r3-name':'نادية فاروق','r3-role':'رئيس العمليات، Maadi Medical','r3-text':'"ماكينة الطعام الطازج في جناح المستشفى غيّرت قواعد اللعبة لموظفي الليل. احترافية وموثوقة."',
    'faq-tag':'الأسئلة الشائعة','faq-title':'أسئلة شائعة',
    'faq1-q':'هل لا توجد تكلفة فعلاً لاستضافة الماكينة؟','faq1-a':'نعم — WYT تتحمل 100% من تكلفة الماكينة والتركيب والصيانة وإعادة التخزين. فقط وفر المساحة ومنفذ كهرباء.',
    'faq2-q':'كم مرة يتم تعبئة الماكينة؟','faq2-a':'نظامنا الذكي يراقب المخزون ويرسل تنبيهاً قبل نفاده. المواقع عالية الحركة تُخدم عدة مرات أسبوعياً.',
    'faq3-q':'ما طرق الدفع المقبولة؟','faq3-a':'جميع ماكينات WYT تقبل البطاقات وApple Pay وGoogle Pay وفوري وVodafone Cash. النقد متاح في بعض الموديلات.',
    'faq4-q':'ماذا يحدث إذا تعطلت الماكينة؟','faq4-a':'يتلقى فريقنا تنبيهاً فورياً. معظم المشاكل تُحل عن بُعد. الزيارات الميدانية تتم خلال 24 ساعة.',
    'faq5-q':'هل يمكننا تخصيص محتوى الماكينة؟','faq5-a':'بالتأكيد. نخصص المنتجات حسب بيئتك — بروتين بار للجيم، وجبات طازجة للمستشفيات، وجبات دراسة للجامعات.',
    'faq6-q':'ما المناطق التي تخدمونها؟','faq6-a':'نعمل حالياً في القاهرة والجيزة والإسكندرية مع خطط توسع طوال 2025-2026.',
    'faq7-q':'كيف أبدأ؟','faq7-a':'فقط املأ نموذج التواصل أدناه وسيرد أحد أعضاء فريقنا خلال 24 ساعة.',
    'contact-tag':'تواصل معنا','contact-title':'لنعمل معاً','contact-sub':'أكمل النموذج وسيرد فريقنا خلال 24 ساعة.',
    'ci-address':'العنوان','ci-phone':'واتساب','ci-email':'البريد الإلكتروني','ci-hours':'ساعات العمل','ci-hours-val':'الأحد–الخميس، 9ص – 5م',
    'trust1':'الاستضافة مجانية 100%','trust2':'بدون عقود','trust3':'رد خلال 24 ساعة',
    'f-fname':'الاسم الأول','f-fname-ph':'أحمد','f-lname':'اسم العائلة','f-lname-ph':'حسن',
    'f-email':'البريد الإلكتروني','f-phone':'الهاتف / واتساب','f-phone-ph':'أدخل رقم هاتفك',
    'f-interest':'أنا مهتم بـ…','f-select':'اختر خياراً',
    'f-opt1':'استضافة ماكينة (مجاناً)','f-opt2':'شراكة علامة تجارية','f-opt3':'توزيع / فرنشايز','f-opt4':'تكامل تقني','f-opt5':'أخرى',
    'f-msg':'الرسالة','f-msg-ph':'أخبرنا عن مساحتك وأهدافك وأي استفسارات…',
    'f-submit':'إرسال الرسالة ←','f-microcopy':'معلوماتك خاصة ولن تُشارك. نرد خلال 24 ساعة.',
    'f-success':'تم إرسال رسالتك! سنتواصل معك خلال 24 ساعة.','f-error':'حدث خطأ. تواصل معنا مباشرة على واتساب.',
    'footer-desc':'حلول بيع ذكية للمساحات الحديثة في مصر.',
    'footer-company':'الشركة','footer-services':'الخدمات','footer-contact':'تواصل معنا',
    'footer-wa':'واتساب','footer-copy':'© 2025 WYT لحلول البيع الآلي. جميع الحقوق محفوظة.',
    'footer-privacy':'الخصوصية','footer-terms':'الشروط','wa-label':'تواصل معنا'
  }
};

/* ══════════════════════
   i18n ENGINE
══════════════════════ */
const i18n = window.i18n = {
  lang: 'en',

  toggle() {
    this.lang = this.lang === 'en' ? 'ar' : 'en';
    this.apply();
    localStorage.setItem('wyt-lang', this.lang);
    if (window.WYT_render) window.WYT_render();
  },

  apply() {
    const t = translations[this.lang];
    const isAr = this.lang === 'ar';

    document.documentElement.lang = this.lang;
    document.body.dir = isAr ? 'rtl' : 'ltr';

    // Text nodes
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (t[key] !== undefined) el.textContent = t[key];
    });

    // HTML nodes (for italic etc)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.dataset.i18nHtml;
      if (t[key] !== undefined) el.innerHTML = t[key];
    });

    // Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (t[key] !== undefined) el.placeholder = t[key];
    });

    // Lang toggle buttons
    document.querySelectorAll('#langToggle, #drawerLangToggle').forEach(btn => {
      btn.textContent = isAr ? 'English' : 'عربي';
    });
  },

  init() {
    const saved = localStorage.getItem('wyt-lang');
    if (saved && saved !== 'en') { this.lang = saved; this.apply(); }
  }
};

/* ══════════════════════
   NAVIGATION
══════════════════════ */
(function initNav() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const drawer    = document.getElementById('drawer');
  const overlay   = document.getElementById('drawerOverlay');
  const closeBtn  = document.getElementById('drawerClose');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.querySelectorAll('.drawer-links a, .drawer-cta').forEach(l => l.addEventListener('click', closeDrawer));

  // Lang toggles
  document.getElementById('langToggle').addEventListener('click', () => i18n.toggle());
  document.getElementById('drawerLangToggle').addEventListener('click', () => i18n.toggle());

  // Active nav links on scroll
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    const y = window.scrollY + 90;
    sections.forEach(s => {
      if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
        links.forEach(l => {
          const active = l.getAttribute('href') === '#' + s.id;
          l.classList.toggle('active', active);
        });
      }
    });
  }, { passive: true });
})();

/* ══════════════════════
   SCROLL REVEAL
══════════════════════ */
/* ══════════════════════
   REUSABLE INIT FUNCTIONS
   (called on load AND after render.js
    injects dynamic content from the CMS)
══════════════════════ */
window.WYT = window.WYT || {};

/* Re-runs the scroll-reveal observer on all .reveal elements
   that don't yet have the .visible class (safe to call repeatedly) */
window.WYT.initReveal = function () {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 60);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
};

/* Animates any .counter element with data-target / data-suffix
   that hasn't been animated yet */
window.WYT.initCounters = function () {
  const counters = document.querySelectorAll('.counter:not([data-counted])');
  if (!counters.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target) || 0;
      const suffix = el.dataset.suffix || '';
      el.setAttribute('data-counted', 'true');
      let start = null;

      const step = ts => {
        if (!start) start = ts;
        const pct  = Math.min((ts - start) / 1800, 1);
        const ease = 1 - Math.pow(1 - pct, 4);
        el.textContent = Math.floor(ease * target) + suffix;
        if (pct < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.7 });

  counters.forEach(el => obs.observe(el));
};

/* Wires up the machine spec modal. machineData comes from the CMS
   (loaded by render.js) and is passed in here. */
window.WYT.initModal = function (machineData) {
  machineData = machineData || [];
  const overlay    = document.getElementById('modalOverlay');
  const modalName  = document.getElementById('modalName');
  const modalDesc  = document.getElementById('modalDesc');
  const modalSpecs = document.getElementById('modalSpecs');
  const modalImg   = document.getElementById('modalImg');
  const closeBtn   = document.getElementById('modalClose');
  if (!overlay) return;

  document.querySelectorAll('[data-modal]').forEach(card => {
    card.addEventListener('click', () => {
      const m = machineData[parseInt(card.dataset.modal)];
      if (!m) return;
      modalName.textContent = m.name;
      modalDesc.textContent = m.desc;
      if (modalImg && m.image) modalImg.src = m.image;
      modalSpecs.innerHTML = (m.specs || []).map(s => `<div><label>${s.l}</label><span>${s.v}</span></div>`).join('');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  window.closeModal = () => { overlay.classList.remove('open'); document.body.style.overflow = ''; };
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
};

/* Wires up FAQ accordion items (safe to call repeatedly —
   removes old listeners by cloning nothing, just re-binds) */
window.WYT.initFaq = function () {
  document.querySelectorAll('[data-faq]').forEach(item => {
    const q = item.querySelector('.faq-q');
    if (!q || q.dataset.bound) return;
    q.dataset.bound = 'true';
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('[data-faq]').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
};

/* Run once for any static content present at first paint
   (render.js will call these again after injecting CMS content) */
window.WYT.initReveal();
window.WYT.initCounters();
window.WYT.initFaq();

/* ══════════════════════
   CONTACT FORM → 3 emails + DB
══════════════════════ */
(function initForm() {
  const form        = document.getElementById('contactForm');
  const submitBtn   = document.getElementById('submitBtn');
  const formSuccess = document.getElementById('formSuccess');
  const formError   = document.getElementById('formError');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const t = translations[i18n.lang];

    const payload = {
      firstName : document.getElementById('fn').value.trim(),
      lastName  : document.getElementById('ln').value.trim(),
      email     : document.getElementById('fe').value.trim(),
      phone     : document.getElementById('fp').value.trim() || 'Not provided',
      interest  : document.getElementById('fi').value || 'Not specified',
      message   : document.getElementById('fm').value.trim() || '',
      lang      : i18n.lang
    };

    submitBtn.disabled    = true;
    submitBtn.textContent = i18n.lang === 'ar' ? 'جاري الإرسال…' : 'Sending…';
    formSuccess.style.display = 'none';
    formError.style.display   = 'none';

    try {
      const res    = await fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      const result = await res.json();

      if (result.success) {
        formSuccess.style.display = 'block';
        form.reset();
      } else {
        formError.style.display = 'block';
      }
    } catch {
      formError.style.display = 'block';
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = t['f-submit'] || 'Send Message →';
      setTimeout(() => { formSuccess.style.display = 'none'; formError.style.display = 'none'; }, 8000);
    }
  });
})();

/* ══════════════════════
   INIT
══════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  i18n.init();
});