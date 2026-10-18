#!/usr/bin/env python3
"""Plaquette entreprises FIK (2 pages A4, FR + EN) → public/plaquette-fik-entreprises-{fr,en}.pdf

Usage : python3 docs/plaquette-entreprises/build.py   (depuis la racine du repo, Google Chrome requis)
Pas de prix ni de numéros légaux (RC/NIF) pour l'instant : à ajouter dans TEXT quand Kouider les aura.
"""
import base64, pathlib, subprocess, tempfile

ROOT = pathlib.Path(__file__).resolve().parents[2]
PUB = ROOT / 'public'
CONTACT = {
    'email': 'contact@fikconciergerie.com',
    'wa': '+32 466 31 14 69',
    'addr': 'Rue Derbouz Draoua, Houari, Oran 31300, Algérie',
    'site': 'fikconciergerie.com/entreprises',
}

TEXT = {
    'fr': {
        'kicker': 'Offre entreprises · Oran, Algérie',
        'title': 'Vos équipes à Oran,<br><em>prises en charge de A à Z</em>',
        'lead': "Véhicules, logement, chauffeur et accompagnement sur place pour les sociétés (énergie, BTP, industrie, "
                "multinationales) et leurs partenaires algériens. Un seul interlocuteur, un contrat, une facture au nom de "
                "l'entreprise.",
        'what_h': 'Ce que nous prenons en charge',
        'what': [
            ('Véhicules', 'Citadines, SUV, véhicules haut de gamme et vans pour les groupes ou le matériel, livrés prêts.'),
            ('Logement', "Appartements équipés et maisons proches du lieu de mission, pour quelques jours ou plusieurs mois."),
            ('Chauffeur & accueil', "Accueil à l'aéroport, transferts, chauffeur dédié pour les déplacements de vos cadres."),
            ('Accompagnement local', 'Guide, aide aux démarches et appui dans vos relations avec les sociétés algériennes.'),
        ],
        'why_h': 'Pourquoi les entreprises nous choisissent',
        'why': [
            ('Un seul interlocuteur', 'Voiture, logement, chauffeur, démarches : tout est centralisé. Vos équipes arrivent, tout est prêt.'),
            ('Contrat & facturation société', "Devis écrit, contrat clair, facture au nom de l'entreprise. Conforme et traçable."),
            ('Connaissance du terrain', 'Basés à Oran, nous connaissons la ville, les usages et les bons interlocuteurs.'),
            ('Disponibles 7j/7', 'Un problème sur place, un changement de planning : nous réagissons le jour même.'),
        ],
        'packs_h': 'Trois formules, adaptées à chaque mission',
        'packs_sub': 'Toutes les formules sont sur devis et ajustées selon la durée, le nombre de personnes et vos besoins.',
        'packs': [
            ('Essentiel', 'Mobilité + logement pour vos équipes',
             ['Voiture de location fiable, livrée prête', 'Appartement équipé proche du lieu de mission', 'Facturation société + contrat clair']),
            ('Premium', 'Confort supérieur pour cadres et délégations',
             ['Voiture haut de gamme ou van (groupe / matériel)', 'Appartement haut de gamme ou maison', 'Facturation société + suivi dédié']),
            ('Signature', 'Clé en main total : on gère tout sur place',
             ['Voiture haut de gamme avec chauffeur', 'Maison de standing', 'Chauffeur + guide dédié', 'Accompagnement et aide aux négociations avec les sociétés algériennes']),
        ],
        'popular': 'Le plus demandé',
        'who_h': 'Pour qui',
        'who': ['Énergie & pétrole', 'BTP & infrastructures', 'Industrie & usines', 'Délégations & séminaires', 'Ambassades & ONG', 'Cadres expatriés'],
        'how_h': 'Comment ça se passe',
        'how': [
            ('Votre demande', "Dates de mission, nombre de personnes, besoins : par email ou via le formulaire en ligne."),
            ('Notre proposition', 'Un devis écrit et détaillé, ajusté avec vous si besoin.'),
            ('Contrat & préparation', 'Contrat signé, véhicules et logements préparés avant l’arrivée de vos équipes.'),
            ('Sur place', 'Un interlocuteur unique joignable 7j/7 pendant toute la mission.'),
        ],
        'contact_h': 'Demander un devis',
        'contact_sub': 'Réponse par email, en français, anglais ou arabe.',
        'l_email': 'Email', 'l_wa': 'WhatsApp', 'l_addr': 'Adresse', 'l_site': 'Formulaire',
        'founder': 'Kouider, fondateur de FIK Conciergerie',
    },
    'en': {
        'kicker': 'Corporate services · Oran, Algeria',
        'title': 'Your teams in Oran,<br><em>fully taken care of</em>',
        'lead': 'Vehicles, housing, drivers and on-the-ground support for companies (energy, construction, industry, '
                'multinationals) and their Algerian partners. One single contact, one contract, invoices issued to your company.',
        'what_h': 'What we handle for you',
        'what': [
            ('Vehicles', 'Compact cars, SUVs, executive cars and vans for groups or equipment, delivered ready to drive.'),
            ('Housing', 'Furnished apartments and houses close to the work site, from a few days to several months.'),
            ('Driver & welcome', 'Airport pick-up, transfers and a dedicated driver for your executives.'),
            ('Local support', 'Guide, help with local formalities and support in your dealings with Algerian companies.'),
        ],
        'why_h': 'Why companies choose us',
        'why': [
            ('One single contact', 'Car, housing, driver, paperwork: all in one place. Your teams arrive, everything is ready.'),
            ('Corporate contract & invoicing', 'Written quote, clear contract, invoices in your company name. Compliant and traceable.'),
            ('Local know-how', 'Based in Oran, we know the city, local customs and the right people to talk to.'),
            ('Available 7 days a week', 'An issue on site or a schedule change: we act the same day.'),
        ],
        'packs_h': 'Three packages, tailored to each assignment',
        'packs_sub': 'All packages are quoted on request and adjusted to duration, headcount and your needs.',
        'packs': [
            ('Essential', 'Mobility + housing for your teams',
             ['Reliable rental car, delivered ready', 'Furnished apartment near the work site', 'Company invoicing + clear contract']),
            ('Premium', 'Superior comfort for executives and delegations',
             ['Executive car or van (group / equipment)', 'High-end apartment or house', 'Company invoicing + dedicated follow-up']),
            ('Signature', 'Fully turnkey: we handle everything on site',
             ['Executive car with driver', 'Upscale house', 'Dedicated driver + guide', 'Support and help negotiating with Algerian companies']),
        ],
        'popular': 'Most requested',
        'who_h': 'Who we work for',
        'who': ['Energy & oil', 'Construction & infrastructure', 'Industry & plants', 'Delegations & seminars', 'Embassies & NGOs', 'Expat executives'],
        'how_h': 'How it works',
        'how': [
            ('Your request', 'Assignment dates, headcount, needs: by email or through the online form.'),
            ('Our proposal', 'A detailed written quote, adjusted with you if needed.'),
            ('Contract & set-up', 'Signed contract; vehicles and housing ready before your teams arrive.'),
            ('On site', 'One single contact, reachable 7 days a week for the whole assignment.'),
        ],
        'contact_h': 'Request a quote',
        'contact_sub': 'We reply by email, in English, French or Arabic.',
        'l_email': 'Email', 'l_wa': 'WhatsApp', 'l_addr': 'Address', 'l_site': 'Online form',
        'founder': 'Kouider, founder of FIK Conciergerie',
    },
}

CSS = """
@page { size: A4; margin: 0 }
* { box-sizing: border-box; margin: 0; padding: 0 }
:root { --ink:#141414; --muted:#5d5d5d; --gold:#b8922a; --gold-l:#f3ead2; --line:#e6e0d2; --dark:#0d0d0d }
body { font-family: 'Inter', sans-serif; color: var(--ink); font-size: 10pt; line-height: 1.45; -webkit-print-color-adjust: exact; print-color-adjust: exact }
.page { width: 210mm; height: 297mm; position: relative; overflow: hidden; page-break-after: always; display: flex; flex-direction: column }
.page:last-child { page-break-after: auto }
h1, h2, h3, .serif { font-family: 'Playfair Display', serif }
.head { background: var(--dark); color: #fff; padding: 14mm 16mm 10mm; display: flex; gap: 10mm; align-items: flex-start }
.head img.logo { height: 24mm }
.kicker { color: #d8b65a; font-size: 8pt; letter-spacing: .18em; text-transform: uppercase; margin-bottom: 3mm }
h1 { font-size: 25pt; line-height: 1.1; font-weight: 800 }
h1 em { font-style: normal; color: #d8b65a }
.lead { color: rgba(255,255,255,.78); margin-top: 4mm; font-size: 10.2pt; max-width: 135mm }
.hero { height: 74mm; background: center 60% / cover no-repeat; border-bottom: 1.2mm solid var(--gold) }
.body { padding: 9mm 16mm 0; flex: 1 }
h2 { font-size: 14.5pt; margin-bottom: 4mm; font-weight: 700 }
h2::after { content: ''; display: block; width: 14mm; height: .7mm; background: var(--gold); margin-top: 2mm }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm 8mm; margin-bottom: 8mm }
.item b { display: block; font-size: 10.4pt; margin-bottom: .8mm }
.item p { color: var(--muted); font-size: 9.3pt }
.item { border-left: .7mm solid var(--gold); padding-left: 3.5mm }
.foot { background: var(--dark); color: rgba(255,255,255,.75); font-size: 8.3pt; padding: 5mm 16mm; display: flex; justify-content: space-between }
.foot b { color: #d8b65a; font-weight: 600 }
.packs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; margin-bottom: 3mm }
.pack { border: .3mm solid var(--line); border-radius: 3mm; padding: 6mm 4.5mm 7mm; position: relative; background: #fff }
.pack.feat { border: .6mm solid var(--gold); background: #fffdf7 }
.pack .tag { position: absolute; top: -3mm; left: 4.5mm; background: var(--gold); color: #fff; font-size: 7pt; letter-spacing: .08em; text-transform: uppercase; padding: .8mm 2.5mm; border-radius: 5mm; font-weight: 600 }
.pack .n { font-size: 7.5pt; color: var(--muted); letter-spacing: .14em; text-transform: uppercase }
.pack h3 { font-size: 15pt; margin: 1mm 0 1.5mm }
.pack .tl { color: var(--muted); font-size: 8.8pt; min-height: 9mm; margin-bottom: 2.5mm }
.pack li { list-style: none; font-size: 8.9pt; padding-left: 4.5mm; position: relative; margin-bottom: 1.5mm }
.pack li::before { content: '✓'; position: absolute; left: 0; color: var(--gold); font-weight: 700 }
.note { color: var(--muted); font-size: 8.6pt; font-style: italic; margin-bottom: 10mm }
.who { display: flex; flex-wrap: wrap; gap: 2.5mm; margin-bottom: 10mm }
.who span { border: .3mm solid var(--gold); color: var(--ink); background: var(--gold-l); border-radius: 5mm; padding: 1.5mm 4mm; font-size: 9pt; font-weight: 600 }
.steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4mm; margin-bottom: 12mm }
.step .num { width: 7mm; height: 7mm; border-radius: 50%; background: var(--gold-l); color: var(--gold); font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 9pt; margin-bottom: 2mm }
.step b { display: block; font-size: 9.8pt; margin-bottom: .8mm }
.step p { color: var(--muted); font-size: 8.7pt }
.contact { background: var(--dark); color: #fff; border-radius: 3mm; padding: 7mm 8mm; display: grid; grid-template-columns: 1fr 1.25fr; gap: 6mm; align-items: center }
.contact h2 { color: #fff }
.contact .sub { color: rgba(255,255,255,.7); font-size: 9.2pt }
.contact dl { display: grid; grid-template-columns: auto 1fr; gap: 2mm 4mm; font-size: 9.6pt }
.contact dt { color: #d8b65a; font-size: 8pt; text-transform: uppercase; letter-spacing: .1em; padding-top: .6mm }
.contact dd { color: #fff }
.sign { margin-top: 3mm; font-family: 'Playfair Display', serif; color: #d8b65a; font-size: 10pt }
"""


def data_uri(path, mime):
    return f'data:{mime};base64,' + base64.b64encode(path.read_bytes()).decode()


def html(lang):
    t = TEXT[lang]
    logo = data_uri(PUB / 'logo.png', 'image/png')
    hero = data_uri(PUB / 'entreprises-hero.jpg', 'image/jpeg')
    items = lambda rows: ''.join(f'<div class="item"><b>{h}</b><p>{p}</p></div>' for h, p in rows)
    packs = ''.join(
        f'<div class="pack{" feat" if i == 1 else ""}">{f"<span class=tag>{t["popular"]}</span>" if i == 1 else ""}'
        f'<div class="n">Pack {i + 1}</div><h3>{n}</h3><div class="tl">{tl}</div><ul>{"".join(f"<li>{x}</li>" for x in li)}</ul></div>'
        for i, (n, tl, li) in enumerate(t['packs']))
    steps = ''.join(f'<div class="step"><div class="num">{i + 1}</div><b>{h}</b><p>{p}</p></div>' for i, (h, p) in enumerate(t['how']))
    foot = f'<div class="foot"><span><b>FIK Conciergerie</b> · Oran</span><span>{CONTACT["email"]} · {CONTACT["site"]}</span></div>'
    return f"""<!doctype html><html lang="{lang}"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@700;800&display=block" rel="stylesheet">
<style>{CSS}</style></head><body>
<section class="page">
  <div class="head"><img class="logo" src="{logo}" alt="FIK"><div>
    <div class="kicker">{t['kicker']}</div><h1>{t['title']}</h1><p class="lead">{t['lead']}</p></div></div>
  <div class="hero" style="background-image:url('{hero}')"></div>
  <div class="body">
    <h2>{t['what_h']}</h2><div class="grid2">{items(t['what'])}</div>
    <h2>{t['why_h']}</h2><div class="grid2">{items(t['why'])}</div>
  </div>{foot}
</section>
<section class="page">
  <div class="body" style="padding-top:16mm">
    <h2>{t['packs_h']}</h2><div class="packs">{packs}</div><p class="note">{t['packs_sub']}</p>
    <h2>{t['who_h']}</h2><div class="who">{''.join(f'<span>{w}</span>' for w in t['who'])}</div>
    <h2>{t['how_h']}</h2><div class="steps">{steps}</div>
    <div class="contact"><div><h2>{t['contact_h']}</h2><p class="sub">{t['contact_sub']}</p><p class="sign">{t['founder']}</p></div>
      <dl><dt>{t['l_email']}</dt><dd>{CONTACT['email']}</dd><dt>{t['l_wa']}</dt><dd>{CONTACT['wa']}</dd>
      <dt>{t['l_site']}</dt><dd>{CONTACT['site']}</dd><dt>{t['l_addr']}</dt><dd>{CONTACT['addr'].replace('Algérie', 'Algeria') if lang == 'en' else CONTACT['addr']}</dd></dl></div>
  </div>{foot}
</section></body></html>"""


for lang in TEXT:
    with tempfile.NamedTemporaryFile('w', suffix='.html', delete=False) as f:
        f.write(html(lang))
    out = PUB / f'plaquette-fik-entreprises-{lang}.pdf'
    subprocess.run(['google-chrome', '--headless=new', '--no-sandbox', '--disable-gpu', '--no-pdf-header-footer',
                    '--virtual-time-budget=8000', f'--print-to-pdf={out}', f'file://{f.name}'],
                   check=True, capture_output=True)
    print(out, out.stat().st_size // 1024, 'Ko')
