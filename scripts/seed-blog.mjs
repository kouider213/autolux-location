import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const get = (n) => (env.match(new RegExp(n + '=(.*)')) || [])[1]?.trim();
const supabase = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'));

const posts = [
  {
    slug: 'louer-voiture-oran-sans-caution',
    title_fr: 'Louer une voiture à Oran sans caution : le guide complet',
    title_ar: 'كراء سيارة في وهران بدون كفالة: الدليل الكامل',
    excerpt_fr: 'Comment louer une voiture à Oran sans bloquer de caution, avec kilométrage illimité et livraison à l\'aéroport. Tout ce qu\'il faut savoir.',
    excerpt_ar: 'كيف تكري سيارة في وهران دون حجز كفالة، مع مسافة غير محدودة وتوصيل للمطار. كل ما تحتاج معرفته.',
    body_fr: `Louer une voiture à Oran ne devrait pas être compliqué. Chez Fik Conciergerie, nous avons supprimé les contraintes qui découragent la plupart des clients : pas de caution bloquée, pas de paperasse interminable, et une réservation qui se fait en quelques minutes par WhatsApp.

**Sans caution, vraiment**

Contrairement à beaucoup d'agences à Oran, nous ne bloquons aucune somme sur votre compte. Pour réserver un véhicule, un simple acompte équivalent à 3 jours de location suffit à confirmer votre réservation. Vous gardez votre argent, nous gardons votre confiance.

**Kilométrage illimité sur toute l'Algérie**

Vous partez à Alger, Tlemcen ou dans le sud ? Aucun problème. Tous nos véhicules sont en kilométrage illimité, avec assurance incluse valable sur tout le territoire algérien. Climatisation et chauffage sont également inclus, sans supplément.

**Livraison à l'aéroport d'Oran offerte**

Vous atterrissez à l'aéroport d'Oran ? Nous vous livrons le véhicule directement sur place, gratuitement. Vous préférez passer au magasin ? C'est possible aussi. À vous de choisir.

**Comment réserver ?**

Tout se passe par WhatsApp, simplement. Vous choisissez votre véhicule, vous nous envoyez vos dates, et nous confirmons votre réservation en moins d'une heure. Pas besoin de créer un compte, pas de carte bancaire en ligne.

**À savoir avant de louer**

L'âge minimum pour louer est de 35 ans, une exigence de nos assurances qui protège aussi bien nos clients que notre société. Pensez à préparer votre permis de conduire et une pièce d'identité.

Prêt à réserver votre voiture à Oran ? Contactez-nous sur WhatsApp, nous nous occupons du reste.`,
    body_ar: `كراء سيارة في وهران لا يجب أن يكون معقّداً. في فيك كونسيرجري، أزلنا العوائق التي تُثبّط معظم الزبائن: بدون كفالة محجوزة، بدون أوراق لا تنتهي، وحجز يتم في دقائق عبر واتساب.

**بدون كفالة، حقاً**

على عكس كثير من الوكالات في وهران، لا نحجز أي مبلغ على حسابك. لحجز سيارة، تكفي تسبقة تعادل 3 أيام كراء لتأكيد حجزك. تحتفظ بأموالك، ونحتفظ بثقتك.

**مسافة غير محدودة في كامل الجزائر**

ذاهب إلى الجزائر العاصمة أو تلمسان أو الجنوب؟ لا مشكلة. كل سياراتنا بمسافة غير محدودة، مع تأمين مشمول صالح في كامل التراب الجزائري. التكييف والتدفئة مشمولان أيضاً دون أي زيادة.

**التوصيل مجاني في مطار وهران**

تنزل في مطار وهران؟ نوصل لك السيارة مباشرة هناك، مجاناً. تفضّل المرور إلى المحل؟ ممكن أيضاً. الخيار لك.

**كيف تحجز؟**

كل شيء يتم عبر واتساب ببساطة. تختار سيارتك، ترسل لنا تواريخك، ونؤكّد حجزك في أقل من ساعة. لا حاجة لإنشاء حساب، ولا بطاقة بنكية على الإنترنت.

**ما يجب معرفته قبل الكراء**

السن الأدنى للكراء هو 35 سنة، شرط من تأميناتنا يحمي زبائننا وشركتنا. جهّز رخصة السياقة وبطاقة التعريف.

مستعد لحجز سيارتك في وهران؟ تواصل معنا على واتساب، ونحن نتكفّل بالباقي.`,
  },
  {
    slug: 'acheter-voiture-occasion-oran',
    title_fr: 'Acheter une voiture d\'occasion à Oran : nos conseils',
    title_ar: 'شراء سيارة مستعملة في وهران: نصائحنا',
    excerpt_fr: 'Les points à vérifier avant d\'acheter une voiture d\'occasion à Oran, et comment Fik Conciergerie sécurise votre achat.',
    excerpt_ar: 'النقاط التي يجب التحقق منها قبل شراء سيارة مستعملة في وهران، وكيف تؤمّن فيك كونسيرجري عمليتك.',
    body_fr: `Acheter une voiture d'occasion à Oran est un investissement important. Pour éviter les mauvaises surprises, voici les points essentiels à vérifier — et comment nous vous accompagnons.

**Vérifiez l'historique du véhicule**

Avant tout achat, renseignez-vous sur le kilométrage réel, l'historique d'entretien et les éventuels accidents. Un véhicule bien suivi vous évitera des frais imprévus. Chez Fik Conciergerie, chaque véhicule à vendre est présenté avec ses informations clés : année, kilométrage, carburant, état.

**Inspectez l'état mécanique et la carrosserie**

Moteur, boîte de vitesses, pneus, freins, climatisation : un essai routier est indispensable. Vérifiez aussi la carrosserie et l'absence de corrosion. N'hésitez pas à demander un avis mécanique.

**Comparez les prix du marché**

Le prix doit correspondre à l'état réel et au marché oranais. Un prix trop bas cache souvent un problème. Nos véhicules sont affichés à des prix justes, sans mauvaise surprise.

**Des papiers en règle**

Carte grise, contrôle technique, quitus fiscal : assurez-vous que tous les documents sont en ordre avant de finaliser. Nous vous accompagnons sur tout le processus.

**Pourquoi passer par Fik Conciergerie ?**

Nous sélectionnons des véhicules fiables et vous mettons en relation directement. Pas d'intermédiaires douteux : vous échangez avec nous sur WhatsApp, en toute transparence. Vous voyez un véhicule qui vous intéresse sur notre site ? Envoyez-nous un message, nous organisons la visite et l'essai.

Trouvez votre prochaine voiture d'occasion à Oran en toute confiance. Contactez-nous sur WhatsApp.`,
    body_ar: `شراء سيارة مستعملة في وهران استثمار مهم. لتجنّب المفاجآت السيئة، إليك أهم النقاط التي يجب التحقق منها — وكيف نرافقك.

**تحقّق من تاريخ السيارة**

قبل أي شراء، استعلم عن المسافة الحقيقية وتاريخ الصيانة والحوادث المحتملة. سيارة بصيانة جيدة تجنّبك مصاريف غير متوقّعة. في فيك كونسيرجري، كل سيارة للبيع تُعرض بمعلوماتها الأساسية: السنة، المسافة، الوقود، الحالة.

**افحص الحالة الميكانيكية والهيكل**

المحرك، علبة السرعات، العجلات، الفرامل، التكييف: تجربة على الطريق ضرورية. تحقّق أيضاً من الهيكل وغياب الصدأ. لا تتردّد في طلب رأي ميكانيكي.

**قارن أسعار السوق**

يجب أن يتناسب السعر مع الحالة الحقيقية وسوق وهران. سعر منخفض جداً غالباً يخفي مشكلة. سياراتنا معروضة بأسعار عادلة، دون مفاجآت.

**أوراق سليمة**

البطاقة الرمادية، الفحص التقني، الكيتوس الجبائي: تأكّد أن كل الوثائق في محلّها قبل الإتمام. نرافقك في كل العملية.

**لماذا عبر فيك كونسيرجري؟**

نختار سيارات موثوقة ونضعك في تواصل مباشر. لا وسطاء مشبوهين: تتواصل معنا على واتساب بكل شفافية. رأيت سيارة تهمّك على موقعنا؟ أرسل لنا رسالة، ننظّم المعاينة والتجربة.

اعثر على سيارتك المستعملة القادمة في وهران بكل ثقة. تواصل معنا على واتساب.`,
  },
  {
    slug: 'immobilier-oran-louer-acheter',
    title_fr: 'Immobilier à Oran : louer ou acheter, comment ça marche',
    title_ar: 'العقارات في وهران: الكراء أو الشراء، كيف يعمل الأمر',
    excerpt_fr: 'Location ou achat d\'un bien à Oran : conseils pratiques et accompagnement Fik Conciergerie, du premier contact à la signature.',
    excerpt_ar: 'كراء أو شراء عقار في وهران: نصائح عملية ومرافقة فيك كونسيرجري، من أول تواصل إلى التوقيع.',
    body_fr: `Que vous cherchiez à louer un appartement ou à acheter un bien à Oran, le marché immobilier peut sembler complexe. Fik Conciergerie simplifie chaque étape, de la recherche à la signature.

**Définir votre besoin**

Location ou achat ? Quartier, budget, surface, nombre de chambres : plus votre besoin est précis, plus nous trouvons vite le bien qui vous convient. Dites-nous ce que vous cherchez, nous filtrons pour vous.

**La location à Oran**

Pour une location, pensez au dépôt de garantie, à la durée minimale et aux charges (incluses ou non). Nous vous présentons des biens clairs, avec toutes les informations : loyer, charges, caution, durée.

**L'achat d'un bien**

Acheter demande de vérifier les titres de propriété, la conformité et l'environnement du quartier. Nous vous accompagnons pour éviter les pièges et sécuriser votre investissement.

**Vous êtes propriétaire ?**

Vous avez un bien à louer ou à vendre ? Confiez-le nous. Nous le mettons en valeur sur notre site, nous gérons les contacts et nous vous présentons des clients sérieux. Tout passe par notre WhatsApp, simplement.

**Un seul interlocuteur**

Pas de multiples intermédiaires : vous échangez directement avec nous. Vous voyez un bien sur notre page Immobilier ? Un message WhatsApp suffit pour organiser une visite.

Cherchez, louez ou vendez votre bien à Oran avec Fik Conciergerie. Contactez-nous dès maintenant.`,
    body_ar: `سواء كنت تبحث عن كراء شقة أو شراء عقار في وهران، قد يبدو سوق العقارات معقّداً. فيك كونسيرجري تبسّط كل خطوة، من البحث إلى التوقيع.

**حدّد حاجتك**

كراء أو شراء؟ الحي، الميزانية، المساحة، عدد الغرف: كلما كانت حاجتك دقيقة، وجدنا أسرع العقار المناسب لك. أخبرنا بما تبحث عنه، ونحن نصفّي لك.

**الكراء في وهران**

للكراء، فكّر في الضمان والمدّة الدنيا والأعباء (مشمولة أو لا). نعرض لك عقارات واضحة بكل المعلومات: الإيجار، الأعباء، الضمان، المدّة.

**شراء عقار**

الشراء يتطلّب التحقّق من سندات الملكية والمطابقة ومحيط الحي. نرافقك لتجنّب الفخاخ وتأمين استثمارك.

**أنت مالك؟**

لديك عقار للكراء أو البيع؟ ائتمنّا عليه. نُبرزه على موقعنا، نتكفّل بالاتصالات، ونقدّم لك زبائن جدّيين. كل شيء عبر واتساب ببساطة.

**متحدّث واحد**

لا وسطاء متعدّدون: تتواصل معنا مباشرة. رأيت عقاراً على صفحة العقارات؟ رسالة واتساب تكفي لتنظيم معاينة.

ابحث، اكترِ أو بِع عقارك في وهران مع فيك كونسيرجري. تواصل معنا الآن.`,
  },
  {
    slug: 'importer-voiture-algerie-guide',
    title_fr: 'Importer une voiture en Algérie : prix, délais et démarches',
    title_ar: 'استيراد سيارة إلى الجزائر: الأسعار، الآجال والإجراءات',
    excerpt_fr: 'Comment commander et importer le véhicule de vos rêves en Algérie via Fik Conciergerie : étapes, acompte et conseils.',
    excerpt_ar: 'كيف تطلب وتستورد سيارة أحلامك إلى الجزائر عبر فيك كونسيرجري: الخطوات، التسبقة والنصائح.',
    body_fr: `Vous ne trouvez pas le véhicule exact que vous cherchez en Algérie ? La commande sur mesure et l'import sont la solution. Fik Conciergerie s'occupe de tout, de la recherche à la livraison.

**Décrivez le véhicule voulu**

Marque, modèle, année, motorisation, couleur, budget : plus votre demande est précise, mieux nous ciblons. Vous décrivez votre voiture idéale, nous la cherchons pour vous.

**Devis et acompte**

Une fois le véhicule trouvé, nous vous présentons un devis clair. Un acompte permet de lancer la commande et de bloquer le véhicule. Le pourcentage d'acompte est indiqué sur notre page commande.

**Délais réalistes**

L'import prend du temps : recherche, transport, dédouanement. Nous vous donnons des délais réalistes dès le départ, sans fausses promesses. Vous êtes informé à chaque étape.

**Les démarches administratives**

Dédouanement, mise en conformité, immatriculation : ces étapes sont essentielles. Nous vous accompagnons pour que tout soit en règle, sans stress.

**Pourquoi nous faire confiance ?**

Nous travaillons en transparence totale : vous échangez directement avec nous sur WhatsApp, vous suivez l'avancement, et vous ne payez que ce qui est convenu. Pas de mauvaise surprise.

Vous avez une voiture en tête ? Décrivez-la nous sur WhatsApp ou via notre page commande sur mesure. Nous la trouvons et nous l'importons pour vous.`,
    body_ar: `لا تجد السيارة المطلوبة بالضبط في الجزائر؟ الطلب الخاص والاستيراد هو الحل. فيك كونسيرجري تتكفّل بكل شيء، من البحث إلى التسليم.

**صف السيارة المطلوبة**

العلامة، الطراز، السنة، المحرّك، اللون، الميزانية: كلما كان طلبك دقيقاً، استهدفنا أفضل. تصف سيارتك المثالية، ونحن نبحث عنها لك.

**عرض السعر والتسبقة**

بمجرّد إيجاد السيارة، نقدّم لك عرض سعر واضح. التسبقة تسمح بإطلاق الطلب وحجز السيارة. نسبة التسبقة مذكورة في صفحة الطلب.

**آجال واقعية**

الاستيراد يأخذ وقتاً: البحث، النقل، التخليص الجمركي. نعطيك آجالاً واقعية من البداية، دون وعود كاذبة. تبقى على اطّلاع في كل خطوة.

**الإجراءات الإدارية**

التخليص الجمركي، المطابقة، التسجيل: هذه الخطوات أساسية. نرافقك لتكون كل الأمور سليمة، دون ضغط.

**لماذا تثق بنا؟**

نعمل بشفافية تامّة: تتواصل معنا مباشرة على واتساب، تتابع التقدّم، وتدفع فقط ما تم الاتفاق عليه. دون مفاجآت.

لديك سيارة في بالك؟ صفها لنا على واتساب أو عبر صفحة الطلب الخاص. نجدها ونستوردها لك.`,
  },
];

const rows = posts.map(p => ({ ...p, cover_url: '', published: true, updated_at: new Date().toISOString() }));

const { data, error } = await supabase.from('blog_posts').upsert(rows, { onConflict: 'slug' }).select('slug');
if (error) { console.error('ERREUR:', error.message); process.exit(1); }
console.log('OK — articles publiés:', data.map(d => d.slug).join(', '));
