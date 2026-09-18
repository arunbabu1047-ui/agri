export const categories = [
  { id: 'crop', name_en: 'Crop cultivation', name_ta: 'பயிர் சாகுபடி', icon: '🌾', color: '#e7f3df' },
  { id: 'soil', name_en: 'Soil & water', name_ta: 'மண் மற்றும் நீர்', icon: '🪨', color: '#f7ead7' },
  { id: 'organic', name_en: 'Organic farming', name_ta: 'இயற்கை விவசாயம்', icon: '🍃', color: '#e0f1e5' },
  { id: 'livestock', name_en: 'Livestock', name_ta: 'கால்நடை', icon: '🐄', color: '#f7e5dc' },
  { id: 'machinery', name_en: 'Farm machinery', name_ta: 'விவசாய இயந்திரங்கள்', icon: '🚜', color: '#e8eddf' },
  { id: 'technology', name_en: 'Agri technology', name_ta: 'விவசாயத் தொழில்நுட்பம்', icon: '📡', color: '#e3eef1' },
];

export const news = [
  {
    id: 'soil-health-basics', slug: 'soil-health-basics-for-a-stronger-season', category_id: 'soil', status: 'published', author_name: 'Agri Pulse editorial team', date: '2025-06-18', read_time: '6 min', tags: ['soil', 'field notes'], sample: true,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85',
    title_en: 'A simple soil health check before the next season', title_ta: 'அடுத்த பருவத்திற்கு முன் மண் நலத்தை அறியும் எளிய வழி',
    summary_en: 'A field-friendly starting point for observing soil structure, moisture, and organic matter before making the next crop plan.', summary_ta: 'அடுத்த பயிர்த் திட்டத்தை உருவாக்கும் முன் மண்ணின் அமைப்பு, ஈரப்பதம் மற்றும் கரிமப் பொருளை கவனிக்க உதவும் எளிய தொடக்கம்.',
    body_en: 'Healthy soil is a living foundation. Before the next season, walk a few representative spots in the field and observe how the soil holds together, how quickly water moves through it, and what organic material is returning to the surface. These observations are not a replacement for a laboratory test, but they can help frame better questions for one.\n\nStart with three small checks: squeeze a handful of moist soil to notice its structure, look for roots and earthworm activity, and compare low and high areas after irrigation or rain. Record what you see alongside the crop and input history. Over time, this simple notebook can reveal patterns that are easy to miss in a single visit.', body_ta: 'ஆரோக்கியமான மண் உயிருடன் இருக்கும் அடித்தளம். அடுத்த பருவத்திற்கு முன் வயலின் சில பகுதிகளைச் சுற்றிப் பார்த்து, மண் எவ்வாறு ஒன்றாகப் பிடித்திருக்கிறது, நீர் எவ்வளவு விரைவாக ஊடுருவுகிறது, மேல்பரப்பில் கரிமப் பொருள் எவ்வாறு சேர்கிறது என்பதை கவனியுங்கள். இந்தக் கவனிப்புகள் ஆய்வகப் பரிசோதனைக்கு மாற்றாக அல்ல; ஆனால் அது தொடர்பான நல்ல கேள்விகளை உருவாக்க உதவும்.\n\nமூன்று சிறிய சோதனைகளுடன் தொடங்குங்கள்: ஈரமான மண்ணை ஒரு கைப்பிடி எடுத்து அதன் அமைப்பைக் கவனியுங்கள்; வேர்கள் மற்றும் மண்புழு செயல்பாட்டைப் பாருங்கள்; மழை அல்லது பாசனத்திற்குப் பிறகு தாழ்வான மற்றும் உயரமான இடங்களை ஒப்பிடுங்கள். பயிர் மற்றும் உள்ளீட்டு வரலாற்றுடன் நீங்கள் பார்ப்பதைப் பதிவு செய்யுங்கள்.',
  },
  {
    id: 'water-wise-irrigation', slug: 'water-wise-irrigation-starts-with-observation', category_id: 'soil', status: 'published', author_name: 'Meena Rajan', date: '2025-06-12', read_time: '4 min', tags: ['irrigation', 'water'], sample: true,
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=85',
    title_en: 'Water-wise irrigation starts with observation', title_ta: 'நீர் சிக்கனப் பாசனம் கவனிப்பிலிருந்து தொடங்குகிறது',
    summary_en: 'Small changes in timing, soil checks, and field zoning can make irrigation decisions more intentional.', summary_ta: 'நேரம், மண் கவனிப்பு மற்றும் வயல் மண்டலங்களில் சிறிய மாற்றங்கள் பாசன முடிவுகளைத் தெளிவாக்கும்.',
    body_en: 'Irrigation is a conversation between the crop, soil, and weather. A simple record of when a field was watered, how long it took, and how the soil looked the following morning can be more useful than a fixed routine.\n\nDivide the field into observation zones and look for differences in slope, shade, and soil texture. If some areas remain wet while others dry quickly, that is a cue to inspect distribution rather than simply adding more water. Use local agronomy guidance for crop-specific scheduling and keep your notes practical.', body_ta: 'பாசனம் என்பது பயிர், மண் மற்றும் வானிலைக்கிடையேயான உரையாடல். வயலுக்கு எப்போது நீர் விடப்பட்டது, எவ்வளவு நேரம் ஆனது, மறுநாள் காலை மண் எப்படி இருந்தது என்பதைக் குறித்துக் கொள்வது ஒரு நிலையான பழக்கத்தை விட பயனுள்ளதாக இருக்கும்.\n\nசரிவு, நிழல் மற்றும் மண் தன்மையில் உள்ள வேறுபாடுகளைப் பார்க்க வயலைக் கவனிப்பு மண்டலங்களாகப் பிரியுங்கள். சில பகுதிகள் ஈரமாகவும் மற்றவை விரைவாக உலரவும் இருந்தால், கூடுதல் நீர் விடுவதற்கு முன் பாசனப் பரவலை ஆய்வு செய்யுங்கள்.',
  },
  {
    id: 'small-farm-machinery', slug: 'choosing-small-farm-machinery-with-confidence', category_id: 'machinery', status: 'published', author_name: 'Karthik S.', date: '2025-05-28', read_time: '5 min', tags: ['machinery', 'planning'], sample: true,
    image: 'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&w=1200&q=85',
    title_en: 'Choosing small farm machinery with confidence', title_ta: 'சிறு விவசாய இயந்திரங்களை நம்பிக்கையுடன் தேர்வு செய்வது',
    summary_en: 'A decision checklist for comparing the job, total cost, maintenance, and access before buying or renting equipment.', summary_ta: 'இயந்திரம் வாங்கும் அல்லது வாடகைக்கு எடுக்கும் முன் வேலை, மொத்தச் செலவு, பராமரிப்பு மற்றும் அணுகலை ஒப்பிட உதவும் சரிபார்ப்புப் பட்டியல்.',
    body_en: 'The right machine is the one that fits the job and the farm context. Write down the task, field size, soil conditions, available operators, transport needs, and the maintenance support nearby. Compare the full cost of ownership with the cost of hiring the same task out.\n\nA short demonstration on your own field is often more informative than a brochure. Ask for safety guidance, spare-part availability, and a realistic service schedule before making a commitment.', body_ta: 'சரியான இயந்திரம் என்பது வேலையுக்கும் பண்ணைச் சூழலுக்கும் பொருந்துவது. செய்ய வேண்டிய பணி, வயல் அளவு, மண் நிலை, இயந்திரத்தை இயக்கக் கூடியவர்கள், போக்குவரத்து தேவை மற்றும் அருகிலுள்ள பராமரிப்பு உதவியைப் பதிவு செய்யுங்கள். அந்த வேலையை வெளியிலிருந்து செய்யும் செலவுடன் மொத்த உரிமைச் செலவை ஒப்பிடுங்கள்.\n\nஉங்கள் சொந்த வயலில் ஒரு சிறிய சோதனை, விளம்பரத் துண்டுப் பிரசுரத்தை விட பயனுள்ளதாக இருக்கும். பாதுகாப்பு வழிகாட்டுதல், உதிரிபாகங்கள் கிடைப்பது, பராமரிப்பு அட்டவணை ஆகியவற்றை முன்கூட்டியே கேளுங்கள்.',
  },
  {
    id: 'sample-draft', slug: 'draft-field-story', category_id: 'organic', status: 'draft', author_name: 'Contributor preview', date: '2025-06-20', read_time: '3 min', tags: ['draft'], sample: true,
    image: 'https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?auto=format&fit=crop&w=1200&q=85',
    title_en: 'Draft: notes from a compost trial', title_ta: 'வரைவு: உரம் தயாரிப்பு சோதனைக் குறிப்புகள்', summary_en: 'This sample draft is visible only in the admin preview.', summary_ta: 'இந்த மாதிரி வரைவு நிர்வாக முன்னோட்டத்தில் மட்டும் தெரியும்.', body_en: 'Draft content.', body_ta: 'வரைவு உள்ளடக்கம்.'
  },
];

export const videos = [
  { id: 'compost-quick-start', slug: 'compost-quick-start', category_id: 'organic', status: 'published', spoken_language: 'Tamil', duration: '08:42', sample: true, image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=85', title_en: 'Compost: a quick start for the home plot', title_ta: 'இயற்கை உரம்: சிறிய நிலத்திற்கான விரைவான தொடக்கம்', description_en: 'A simple visual introduction to separating organic matter and building a small compost pile.', description_ta: 'கரிமப் பொருட்களைப் பிரித்து சிறிய உரக் குவியலை உருவாக்குவதற்கான எளிய அறிமுகம்.', youtube_url: 'https://www.youtube.com/watch?v=ScdU0Q6nr9g' },
  { id: 'seedling-care', slug: 'seedling-care-in-the-first-two-weeks', category_id: 'crop', status: 'published', spoken_language: 'English', duration: '06:18', sample: true, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1000&q=85', title_en: 'Seedling care in the first two weeks', title_ta: 'முதல் இரண்டு வாரங்களில் நாற்றுப் பராமரிப்பு', description_en: 'A calm checklist for checking light, moisture, airflow, and early growth.', description_ta: 'ஒளி, ஈரப்பதம், காற்றோட்டம் மற்றும் ஆரம்ப வளர்ச்சியைச் சரிபார்க்கும் அமைதியான பட்டியல்.', youtube_url: 'https://www.youtube.com/watch?v=7E9L0D7M7vU' },
  { id: 'field-notebook', slug: 'make-a-field-notebook-work-for-you', category_id: 'technology', status: 'published', spoken_language: 'Tamil + English', duration: '05:04', sample: true, image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?auto=format&fit=crop&w=1000&q=85', title_en: 'Make a field notebook work for you', title_ta: 'களக் குறிப்பேட்டை உங்களுக்காகப் பயன்படுத்துங்கள்', description_en: 'How to capture small observations that become useful over a whole season.', description_ta: 'ஒரு முழுப் பருவத்தில் பயனுள்ளதாக மாறும் சிறிய கவனிப்புகளை எவ்வாறு பதிவு செய்வது.', youtube_url: 'https://www.youtube.com/watch?v=ScdU0Q6nr9g' },
];

export const resources = [
  { id: 'soil-observation-sheet', category_id: 'soil', type: 'guide', status: 'published', sample: true, title_en: 'Soil observation sheet', title_ta: 'மண் கவனிப்பு தாள்', description_en: 'A printable one-page worksheet for noting soil structure, moisture, roots, and field differences.', description_ta: 'மண் அமைப்பு, ஈரப்பதம், வேர்கள் மற்றும் வயல் வேறுபாடுகளைப் பதிவு செய்யும் ஒரு பக்கப் பணித்தாள்.', source: 'Agri Pulse sample resource', icon: 'description' },
  { id: 'crop-planning-notes', category_id: 'crop', type: 'article', status: 'published', sample: true, title_en: 'Crop planning: questions to bring to a field visit', title_ta: 'பயிர்த் திட்டமிடல்: களப் பார்வைக்குக் கொண்டு செல்ல வேண்டிய கேள்விகள்', description_en: 'A short reference article for turning observations into a next-step conversation.', description_ta: 'கவனிப்புகளை அடுத்த கட்ட உரையாடலாக மாற்றும் குறுகிய குறிப்பு.', source: 'Agri Pulse sample resource', icon: 'article' },
  { id: 'open-agriculture-library', category_id: 'technology', type: 'link', status: 'published', sample: true, title_en: 'Explore the open agriculture library', title_ta: 'திறந்த விவசாய நூலகத்தைப் பாருங்கள்', description_en: 'A placeholder for a vetted external reference link configured by an administrator.', description_ta: 'நிர்வாகி அமைக்கும் சரிபார்க்கப்பட்ட வெளிப்புறக் குறிப்பு இணைப்புக்கான இடம்.', source: 'External reference placeholder', icon: 'open' },
];

export const stats = [
  { label_en: 'Published stories', label_ta: 'வெளியிடப்பட்ட கதைகள்', value: '24' },
  { label_en: 'Learning videos', label_ta: 'கற்றல் வீடியோக்கள்', value: '18' },
  { label_en: 'Useful references', label_ta: 'பயனுள்ள குறிப்புகள்', value: '32' },
];
