// ============================================================================
// Docket recipe library and ingredient prices.
// Prices are Coles estimates (Melbourne, Oct 2026). Woolies and Aldi are derived from these.
// Quantities in recipes are PER SERVE (one dinner portion). The planner scales them.
//
// Ingredient fields:
//   n name · a aisle · u unit (g, ml, ea) · pk pack size · p pack price · pr protein per 100g/ml (or per each)
//   t tag for filters (red, pork, seafood) · pl pack label · ck check the label for gluten
//   noAldi not stocked at Aldi · pan pantry item (costed by what you use; listed under "Pantry check")
//   Kitchen display: tsp/tbsp = grams per teaspoon/tablespoon · cup = grams per cup
//                    ea = [grams each, "word"] · cl = cloves per bulb
// ============================================================================

const AISLE={M:'Meat & seafood',F:'Fruit & veg',D:'Dairy, eggs & fridge',Z:'Freezer',P:'Pantry & tins',B:'Bakery',G:'Gluten free',K:'Pantry check (buy if you\'re out)'};

const ING={
 // Meat & seafood
 chk_thigh:{n:'Chicken thigh fillets',a:'M',u:'g',pk:1000,p:15.00,pr:20},
 chk_breast:{n:'Chicken breast fillets',a:'M',u:'g',pk:1000,p:13.00,pr:23},
 chk_whole:{n:'Whole chicken (1.8kg)',a:'M',u:'g',pk:1800,p:13.50,pr:13,pl:'1.8kg bird'},
 beef_mince:{n:'Beef mince (3 star)',a:'M',u:'g',pk:1000,p:14.00,pr:19,t:'red'},
 beef_rump:{n:'Rump steak',a:'M',u:'g',pk:1000,p:27.00,pr:22,t:'red'},
 beef_chuck:{n:'Beef chuck (slow cook)',a:'M',u:'g',pk:1000,p:18.00,pr:20,t:'red'},
 pork_shoulder:{n:'Pork shoulder, boneless',a:'M',u:'g',pk:1000,p:12.00,pr:18,t:'pork'},
 pork_roast:{n:'Pork shoulder roast, rind on',a:'M',u:'g',pk:1000,p:11.00,pr:16,t:'pork'},
 pork_mince:{n:'Pork mince',a:'M',u:'g',pk:500,p:7.50,pr:18,t:'pork'},
 lamb_sh:{n:'Lamb shoulder (bone-in)',a:'M',u:'g',pk:1000,p:15.00,pr:15,t:'red'},
 salmon:{n:'Salmon fillets, skin on',a:'M',u:'g',pk:1000,p:36.00,pr:20,t:'seafood'},
 chorizo:{n:'Chorizo',a:'M',u:'g',pk:250,p:6.00,pr:24,t:'pork',ck:1},
 bacon:{n:'Middle bacon',a:'M',u:'g',pk:250,p:5.50,pr:16,t:'pork'},
 ham:{n:'Shaved ham',a:'M',u:'g',pk:200,p:4.50,pr:18,t:'pork'},

 // Dairy, eggs & fridge
 eggs:{n:'Free-range eggs',a:'D',u:'ea',pk:12,p:6.50,pr:6.5,pl:'dozen',ea:[1,'egg']},
 cream:{n:'Thickened cream',a:'D',u:'ml',pk:600,p:4.50,pr:2},
 milk:{n:'Full cream milk',a:'D',u:'ml',pk:2000,p:3.10,pr:3.4},
 butter:{n:'Butter',a:'D',u:'g',pk:250,p:4.50,pr:.8,tbsp:14},
 cheese:{n:'Grated tasty cheese',a:'D',u:'g',pk:700,p:9.00,pr:25,cup:100},
 mozz:{n:'Grated mozzarella',a:'D',u:'g',pk:500,p:7.00,pr:22,cup:100},
 parm:{n:'Parmesan',a:'D',u:'g',pk:250,p:6.50,pr:35},
 fetta:{n:'Fetta',a:'D',u:'g',pk:200,p:4.50,pr:17},
 slices:{n:'Burger cheese slices (12)',a:'D',u:'ea',pk:12,p:4.50,pr:3.5,pl:'12 pack',ea:[1,'slice']},
 sourcream:{n:'Sour cream',a:'D',u:'ml',pk:300,p:2.60,pr:3},
 yoghurt:{n:'Greek yoghurt',a:'D',u:'g',pk:1000,p:6.00,pr:9,cup:250},
 kimchi:{n:'Kimchi',a:'D',u:'g',pk:400,p:7.50,pr:1.5,ck:1},

 // Fruit & veg
 potato:{n:'Washed potatoes',a:'F',u:'g',pk:2000,p:5.00,pr:2,ea:[200,'potato']},
 swpotato:{n:'Sweet potato',a:'F',u:'g',pk:1000,p:4.90,pr:1.6},
 onion:{n:'Brown onions',a:'F',u:'g',pk:1000,p:3.50,pr:1.1,ea:[150,'onion']},
 red_onion:{n:'Red onion',a:'F',u:'ea',pk:1,p:0.80,pr:1.5,ea:[1,'red onion']},
 garlic:{n:'Garlic',a:'F',u:'ea',pk:1,p:1.20,pr:.3,pl:'bulb',cl:10},
 ginger:{n:'Fresh ginger',a:'F',u:'g',pk:100,p:2.50,pr:2},
 carrot:{n:'Carrots',a:'F',u:'g',pk:1000,p:2.50,pr:.9,ea:[120,'carrot']},
 broccoli:{n:'Broccoli',a:'F',u:'g',pk:500,p:3.45,pr:2.8},
 capsicum:{n:'Red capsicum',a:'F',u:'ea',pk:1,p:1.80,pr:1.2,ea:[1,'capsicum']},
 zucchini:{n:'Zucchini',a:'F',u:'g',pk:1000,p:5.50,pr:1.2,ea:[200,'zucchini']},
 cherrytom:{n:'Cherry tomatoes',a:'F',u:'g',pk:250,p:3.50,pr:.9},
 spinach:{n:'Baby spinach',a:'F',u:'g',pk:120,p:3.00,pr:2.9},
 cos:{n:'Cos lettuce',a:'F',u:'ea',pk:1,p:3.00,pr:1.5,ea:[1,'cos lettuce']},
 cabbage:{n:'Red cabbage (half)',a:'F',u:'ea',pk:1,p:3.50,pr:1.3,ea:[1,'half cabbage']},
 cucumber:{n:'Continental cucumber',a:'F',u:'ea',pk:1,p:2.00,pr:1,ea:[1,'cucumber']},
 avocado:{n:'Avocado',a:'F',u:'ea',pk:1,p:2.00,pr:3,ea:[1,'avocado']},
 lemon:{n:'Lemons',a:'F',u:'ea',pk:1,p:1.00,pr:0,ea:[1,'lemon']},
 lime:{n:'Limes',a:'F',u:'ea',pk:1,p:0.80,pr:0,ea:[1,'lime']},
 apple:{n:'Green apples',a:'F',u:'ea',pk:1,p:0.90,pr:.3,ea:[1,'apple']},
 springonion:{n:'Spring onions',a:'F',u:'ea',pk:1,p:2.50,pr:.5,pl:'bunch',ea:[1,'bunch']},
 coriander:{n:'Coriander',a:'F',u:'ea',pk:1,p:3.00,pr:0,pl:'bunch',ea:[1,'bunch']},
 parsley:{n:'Flat-leaf parsley',a:'F',u:'ea',pk:1,p:3.00,pr:0,pl:'bunch',ea:[1,'bunch']},
 mint:{n:'Mint',a:'F',u:'ea',pk:1,p:3.00,pr:0,pl:'bunch',ea:[1,'bunch']},
 thaibasil:{n:'Thai basil',a:'F',u:'ea',pk:1,p:3.50,pr:0,pl:'bunch',ea:[1,'bunch']},
 chilli:{n:'Long red chillies',a:'F',u:'ea',pk:1,p:0.40,pr:0,ea:[1,'chilli']},
 mushroom:{n:'Cup mushrooms',a:'F',u:'g',pk:500,p:6.00,pr:3},
 eggplant:{n:'Eggplant',a:'F',u:'ea',pk:1,p:3.50,pr:1,ea:[1,'eggplant']},
 greenbeans:{n:'Green beans',a:'F',u:'g',pk:500,p:4.50,pr:2},

 lamb_mince:{n:'Lamb mince',a:'M',u:'g',pk:500,p:9.00,pr:18,t:'red'},
 pork_belly:{n:'Pork belly',a:'M',u:'g',pk:1000,p:17.00,pr:14,t:'pork'},
 whitefish:{n:'White fish fillets (basa)',a:'M',u:'g',pk:1000,p:14.00,pr:17,t:'seafood'},
 hummus:{n:'Hummus',a:'D',u:'g',pk:200,p:3.50,pr:7},
 beansprouts:{n:'Bean sprouts',a:'F',u:'g',pk:250,p:2.50,pr:3},
 massaman:{n:'Massaman curry paste',a:'P',u:'g',pk:195,p:3.80,pr:2,ck:1,pl:'jar',tbsp:16},
 ricenoodles:{n:'Flat rice noodles',a:'P',u:'g',pk:375,p:2.80,pr:6},
 cornchips:{n:'Plain corn chips',a:'P',u:'g',pk:230,p:3.50,pr:7,ck:1},
 turkish:{n:'Turkish rolls (4)',a:'B',u:'ea',pk:4,p:4.50,pr:9,pl:'4 pack',ea:[1,'roll']},
 currypowder:{n:'Curry powder',a:'K',u:'g',pk:40,p:2.50,pr:0,ck:1,tsp:2.5,pan:1},
 worcestershire:{n:'Worcestershire sauce',a:'K',u:'ml',pk:250,p:3.00,pr:0,ck:1,pan:1},
 // Freezer
 peas:{n:'Frozen peas',a:'Z',u:'g',pk:1000,p:3.50,pr:5,cup:140},
 edamame:{n:'Frozen shelled edamame',a:'Z',u:'g',pk:500,p:4.50,pr:11,cup:150},
 prawns:{n:'Raw peeled prawns',a:'Z',u:'g',pk:1000,p:32.00,pr:20,t:'seafood'},

 // Pantry & tins (bought each week)
 tintom:{n:'Crushed tomatoes (400g tin)',a:'P',u:'g',pk:400,p:1.30,pr:1.2,pl:'tin'},
 passata:{n:'Passata',a:'P',u:'g',pk:700,p:2.50,pr:1.5,cup:250},
 tompaste:{n:'Tomato paste',a:'P',u:'g',pk:140,p:1.20,pr:4,tbsp:16},
 coconut:{n:'Coconut milk (400ml tin)',a:'P',u:'ml',pk:400,p:2.00,pr:1.5,pl:'tin'},
 chickpeas:{n:'Chickpeas (400g tin)',a:'P',u:'g',pk:400,p:1.20,pr:5,pl:'tin'},
 blackbeans:{n:'Black beans (400g tin)',a:'P',u:'g',pk:400,p:1.20,pr:5,pl:'tin'},
 corn:{n:'Corn kernels (420g tin)',a:'P',u:'g',pk:420,p:1.80,pr:2.5,pl:'tin'},
 sundried:{n:'Sun-dried tomatoes',a:'P',u:'g',pk:270,p:4.50,pr:5},
 greencurry:{n:'Green curry paste',a:'P',u:'g',pk:195,p:3.80,pr:2,ck:1,pl:'jar',tbsp:16},
 currypaste:{n:'Tikka curry paste',a:'P',u:'g',pk:190,p:3.50,pr:3,ck:1,pl:'jar',tbsp:16},
 jalapenos:{n:'Pickled jalapeños',a:'P',u:'g',pk:470,p:4.50,pr:0,pl:'jar'},
 pickles:{n:'Dill pickles',a:'P',u:'g',pk:500,p:3.50,pr:0,pl:'jar'},
 peanuts:{n:'Roasted peanuts',a:'P',u:'g',pk:375,p:4.00,pr:25,cup:140},
 arborio:{n:'Arborio rice',a:'P',u:'g',pk:1000,p:4.50,pr:7,cup:200},
 vermicelli:{n:'Rice vermicelli noodles',a:'P',u:'g',pk:400,p:2.80,pr:7},
 pasta:{n:'Pasta (rigatoni or penne)',a:'P',u:'g',pk:500,p:1.80,pr:12},
 lasagne:{n:'Lasagne sheets',a:'P',u:'g',pk:375,p:2.50,pr:12},
 panko:{n:'Panko breadcrumbs',a:'P',u:'g',pk:200,p:2.50,pr:12,cup:60},

 // Bakery
 buns:{n:'Brioche burger buns (6)',a:'B',u:'ea',pk:6,p:4.50,pr:8,pl:'6 pack',ea:[1,'bun']},
 wraps:{n:'Wraps (8)',a:'B',u:'ea',pk:8,p:3.50,pr:6,pl:'8 pack',ea:[1,'wrap']},
 tortillas:{n:'Mini flour tortillas (12)',a:'B',u:'ea',pk:12,p:3.50,pr:4,pl:'12 pack',ea:[1,'tortilla']},
 pita:{n:'Lebanese bread (6)',a:'B',u:'ea',pk:6,p:3.50,pr:9,pl:'6 pack',ea:[1,'pita']},
 naan:{n:'Garlic naan (4)',a:'B',u:'ea',pk:4,p:4.50,pr:8,pl:'4 pack',ea:[1,'naan']},

 // Gluten free swaps
 gf_pasta:{n:'GF pasta',a:'G',u:'g',pk:500,p:3.80,pr:7},
 gf_lasagne:{n:'GF lasagne sheets',a:'G',u:'g',pk:250,p:4.80,pr:6,noAldi:1},
 gf_crumbs:{n:'GF breadcrumbs',a:'G',u:'g',pk:200,p:4.50,pr:7,noAldi:1,cup:80},
 gf_buns:{n:'GF burger buns (4)',a:'G',u:'ea',pk:4,p:7.50,pr:5,pl:'4 pack',noAldi:1,ea:[1,'GF bun']},
 gf_wraps:{n:'GF wraps (6)',a:'G',u:'ea',pk:6,p:7.00,pr:3,pl:'6 pack',ea:[1,'GF wrap']},
 corn_tortillas:{n:'Corn tortillas',a:'G',u:'ea',pk:12,p:4.50,pr:2,pl:'12 pack',ck:1,noAldi:1,ea:[1,'corn tortilla']},
 tamari:{n:'Tamari (GF soy sauce)',a:'G',u:'ml',pk:250,p:5.00,pr:10,pan:1},
 gf_flour:{n:'GF plain flour',a:'G',u:'g',pk:1000,p:4.00,pr:3,cup:150,pan:1},
 sriracha:{n:'Sriracha',a:'K',u:'ml',pk:435,p:4.50,pr:0,pan:1},

 // Pantry check: costed by what you use
 rice:{n:'Jasmine rice (5kg)',a:'K',u:'g',pk:5000,p:13.00,pr:7,cup:190,pan:1},
 flour:{n:'Plain flour',a:'K',u:'g',pk:1000,p:1.50,pr:10,cup:150,pan:1},
 cornflour:{n:'Cornflour (100% maize)',a:'K',u:'g',pk:300,p:2.00,pr:0,ck:1,tbsp:8,pan:1},
 soy:{n:'Soy sauce',a:'K',u:'ml',pk:500,p:3.50,pr:8,pan:1},
 fishsauce:{n:'Fish sauce',a:'K',u:'ml',pk:300,p:3.00,pr:5,ck:1,pan:1},
 oyster:{n:'Oyster sauce',a:'K',u:'ml',pk:500,p:3.50,pr:2,ck:1,pan:1},
 sesameoil:{n:'Sesame oil',a:'K',u:'ml',pk:150,p:3.80,pr:0,pan:1},
 ricevinegar:{n:'Rice wine vinegar',a:'K',u:'ml',pk:500,p:3.50,pr:0,pan:1},
 whitevinegar:{n:'White vinegar',a:'K',u:'ml',pk:2000,p:2.00,pr:0,pan:1},
 mirin:{n:'Mirin',a:'K',u:'ml',pk:250,p:4.00,pr:0,pan:1},
 honey:{n:'Honey',a:'K',u:'g',pk:500,p:5.50,pr:.3,tbsp:21,pan:1},
 brownsugar:{n:'Brown sugar',a:'K',u:'g',pk:1000,p:2.50,pr:0,tsp:4.5,pan:1},
 gochujang:{n:'Gochujang',a:'K',u:'g',pk:500,p:6.00,pr:3,ck:1,tbsp:18,pan:1},
 mayo:{n:'Whole-egg mayonnaise',a:'K',u:'g',pk:440,p:4.00,pr:1,tbsp:14,pan:1},
 ketchup:{n:'Tomato sauce',a:'K',u:'ml',pk:500,p:3.00,pr:1,pan:1},
 mustard:{n:'American mustard',a:'K',u:'g',pk:250,p:2.50,pr:4,tsp:5,pan:1},
 sesameseeds:{n:'Sesame seeds',a:'K',u:'g',pk:100,p:2.20,pr:18,tsp:3,pan:1},
 stockpowder:{n:'Chicken stock powder',a:'K',u:'g',pk:168,p:3.50,pr:1,ck:1,tsp:3,pan:1},
 lemongrass:{n:'Lemongrass paste (tube)',a:'K',u:'g',pk:105,p:3.50,pr:0,tsp:5,pan:1},
 cumin:{n:'Ground cumin',a:'K',u:'g',pk:40,p:2.50,pr:0,tsp:2.1,pan:1},
 smokedpaprika:{n:'Smoked paprika',a:'K',u:'g',pk:45,p:2.80,pr:0,tsp:2.3,pan:1},
 garammasala:{n:'Garam masala',a:'K',u:'g',pk:40,p:2.80,pr:0,tsp:2,pan:1},
 turmeric:{n:'Ground turmeric',a:'K',u:'g',pk:40,p:2.50,pr:0,tsp:3,pan:1},
 chilliflakes:{n:'Chilli flakes',a:'K',u:'g',pk:30,p:2.50,pr:0,tsp:1.5,pan:1},
 chillipowder:{n:'Chilli powder',a:'K',u:'g',pk:40,p:2.50,pr:0,tsp:2.7,pan:1},
 oregano:{n:'Dried oregano',a:'K',u:'g',pk:10,p:2.50,pr:0,tsp:1,pan:1},
 cinnamon:{n:'Ground cinnamon',a:'K',u:'g',pk:40,p:2.50,pr:0,tsp:2.6,pan:1}
};

// Regular ingredient -> what gluten free eaters get instead (scaled to the number of GF eaters)
const GFSWAP={panko:'gf_crumbs',flour:'gf_flour',pasta:'gf_pasta',lasagne:'gf_lasagne',buns:'gf_buns',wraps:'gf_wraps',pita:'gf_wraps',naan:'gf_wraps',tortillas:'corn_tortillas',soy:'tamari',gochujang:'sriracha',turkish:'gf_buns'};

// ---------- Recipes (quantities per serve) ----------
// c category · t total minutes · h hands-on minutes (slow cooks) · d one-line description
// i ingredients · m method · l lunch note · g gluten free note
const R=[
 {id:'bulgogi',n:'Korean Beef Bulgogi Bowls',c:'Bowls',t:40,d:'Sticky soy-garlic beef, quick-pickled cucumber, kimchi and gochujang mayo over rice.',
  i:[['beef_rump',240],['soy',25],['brownsugar',8],['sesameoil',5],['garlic',.12],['ginger',6],['springonion',.15],['rice',95],['cucumber',.3],['ricevinegar',10],['gochujang',8],['mayo',15],['kimchi',40],['sesameseeds',2]],
  m:['Freeze the steak for 20 minutes so it slices thin. Slice across the grain into thin strips.','Marinade: soy, brown sugar, sesame oil, grated garlic and ginger, and the white parts of the spring onion. Toss the beef through and leave 15 minutes (or overnight in the fridge).','Rinse the rice and cook it: 1 cup rice to 1½ cups water, lid on, 12 minutes on low, then rest 10 minutes off the heat.','Quick pickles: slice the cucumber thin and toss with rice vinegar and a pinch each of salt and sugar.','Gochujang mayo: stir the gochujang into the mayo, loosen with a splash of water.','Get a pan or wok smoking hot. Cook the beef in small batches, 1 to 2 minutes each, so it chars rather than stews. Pour any leftover marinade in at the end and let it bubble sticky.','Build bowls: rice, beef, pickles and kimchi. Drizzle the mayo, finish with green spring onion and sesame seeds.'],
  l:'Pack the beef and rice together, with the pickles, kimchi and mayo in a separate container so nothing goes soggy.',
  g:'Tamari instead of soy, and sriracha mayo instead of gochujang (most gochujang contains wheat). Kimchi usually is GF but check the label. Marinate the GF beef in its own bowl and cook it first.'},

 {id:'shawarma',n:'Chicken Shawarma Plates',c:'Bowls',t:45,d:'Spiced charred thighs, garlic yoghurt, pink pickled onions and a herby salad, with warm wraps.',
  i:[['chk_thigh',260],['cumin',1.2],['smokedpaprika',1],['turmeric',.5],['cinnamon',.3],['garlic',.12],['lemon',.3],['yoghurt',60],['red_onion',.2],['whitevinegar',10],['brownsugar',3],['cherrytom',60],['cucumber',.25],['parsley',.15],['wraps',1.5]],
  m:['Marinade: half the yoghurt with cumin, smoked paprika, turmeric, cinnamon, half the garlic, the juice of half the lemons, a glug of oil and 1 tsp salt. Coat the chicken and leave at least 20 minutes.','Pink onions: slice the red onion thin, cover with the vinegar, sugar, a pinch of salt and a splash of hot water. Leave 15 minutes.','Garlic yoghurt: the rest of the yoghurt with the remaining garlic (finely grated), a squeeze of lemon and salt.','Cook the chicken in a hot pan, grill or BBQ for 5 to 6 minutes a side until charred and cooked through. Rest 5 minutes, then slice.','Salad: chop the tomatoes, cucumber and parsley, dress with lemon, oil and salt.','Warm the wraps in a dry pan. Everyone builds their own: wrap, chicken, salad, onions and plenty of garlic yoghurt.'],
  l:'Skip the wrap and make it a bowl: chicken over salad, with the yoghurt in a little container. Add leftover rice if you have it.',
  g:'GF wraps, warmed in a separate pan. Everything else is naturally gluten free.'},

 {id:'ragu',n:'Slow-Cooked Beef Ragu',c:'Pasta',t:240,h:30,d:'Chuck braised for hours until it falls apart into a rich tomato sauce, over pasta with parmesan.',
  i:[['beef_chuck',250],['onion',60],['carrot',50],['garlic',.1],['tompaste',15],['tintom',200],['stockpowder',2],['oregano',.5],['pasta',120],['parm',15],['parsley',.05]],
  m:['A Sunday arvo job. Cut the chuck into big chunks, season well and brown hard in a heavy pot in batches. Set aside.','Turn the heat down. Cook the diced onion and carrot in the same pot for 10 minutes until soft, then the garlic for 1 minute.','Stir in the tomato paste and cook 2 minutes until it darkens. Add the crushed tomatoes, oregano, stock powder and enough water to just cover the beef.','Lid on, low simmer for 3 hours (or 160°C in the oven) until the beef falls apart. Stir every 45 minutes and top up with water if it gets thick.','Shred the beef in the pot with two forks and simmer uncovered 15 minutes to thicken. Taste and season.','Cook the pasta, keep a mug of pasta water, and toss through the ragu with a splash of that water. Finish with parmesan and parsley.'],
  l:'Keep the pasta water to loosen it when reheating. It honestly eats better the next day.',
  g:'GF pasta in a separate pot with its own spoon, sauced from the main pot before the regular pasta goes in. Check the stock powder.'},

 {id:'butter',n:'Proper Butter Chicken',c:'Curry',t:50,d:'Yoghurt-marinated thighs in a spiced tomato and cream sauce, with rice, naan and coriander.',
  i:[['chk_thigh',260],['yoghurt',40],['garammasala',3],['cumin',1],['turmeric',.5],['chillipowder',.5],['garlic',.12],['ginger',8],['onion',50],['butter',15],['tompaste',15],['tintom',120],['cream',50],['brownsugar',3],['rice',95],['naan',.5],['coriander',.1]],
  m:['Cut the chicken into bite-size pieces. Mix with the yoghurt, half the garam masala, the turmeric, chilli powder and 1 tsp salt. Leave 20 minutes or overnight.','Cook the rice.','Brown the chicken in batches in a hot pan with a little oil. It doesn\'t need to cook through. Set aside.','Turn the heat down, add the butter and the finely diced onion and cook 8 minutes until soft and golden. Add the grated garlic and ginger, the rest of the garam masala and the cumin for 1 minute.','Stir in the tomato paste for 2 minutes, then the crushed tomatoes and sugar. Simmer 10 minutes, then blitz smooth with a stick blender if you have one.','Add the chicken and cream and simmer 10 minutes until the chicken\'s cooked through. Taste and season.','Serve over rice with warm naan and coriander.'],
  l:'Curry and rice in one container. It reheats perfectly, and the flavour gets better overnight.',
  g:'GF wraps or extra rice instead of naan. Naturally GF otherwise; just check the garam masala label.'},

 {id:'carnitas',n:'Pork Carnitas Tacos',c:'Fakeaway',t:300,h:30,d:'Slow-cooked spiced pork, crisped up in the pan, with slaw, lime crema, jalapeños and avo.',
  i:[['pork_shoulder',260],['cumin',1.2],['oregano',.6],['smokedpaprika',1],['onion',40],['garlic',.1],['lime',.4],['stockpowder',2],['tortillas',2.5],['cabbage',.1],['sourcream',30],['jalapenos',10],['coriander',.12],['avocado',.25]],
  m:['Cut the pork into big chunks. Rub with the cumin, oregano, smoked paprika and 2 tsp salt.','Slow cooker: onion and garlic in the bottom, pork on top, juice of half the limes and the stock powder dissolved in ½ cup water. 8 hours on low or 5 on high. (Oven: covered, 160°C for 3½ hours.)','Shred the pork with two forks and stir it through the juices.','Crisp it up: spread the pork on a tray with a ladle of juices and grill on high for 5 to 8 minutes until the edges are crunchy. Or fry in batches in a hot pan.','Lime crema: sour cream with the juice of the remaining limes and a pinch of salt. Slaw: shred the cabbage thin and toss with a little lime and salt.','Warm the tortillas in a dry pan. Load with pork, slaw, crema, jalapeños, avocado and coriander.'],
  l:'Burrito bowl it: pork over rice and slaw, crema on the side. Keep the avo whole until the day.',
  g:'Corn tortillas instead of flour (check they\'re 100% corn). Check the stock powder.'},

 {id:'greencurry',n:'Thai Green Chicken Curry',c:'Curry',t:40,d:'Green curry with chicken, eggplant, beans and Thai basil over jasmine rice.',
  i:[['chk_thigh',250],['greencurry',30],['coconut',150],['fishsauce',8],['brownsugar',4],['eggplant',.15],['greenbeans',60],['thaibasil',.15],['lime',.2],['chilli',.2],['rice',95]],
  m:['Cook the rice.','Fry the curry paste in a splash of oil for 2 minutes until it smells amazing. Add a third of the coconut milk and cook until the oil splits out.','Add the chicken (bite-size) and stir to coat. Cook 4 minutes.','Pour in the rest of the coconut milk with ½ cup water. Add the eggplant in chunks and simmer 10 minutes.','Add the beans for the last 4 minutes. Season with fish sauce and sugar, taste, adjust.','Off the heat, stir through the Thai basil and a squeeze of lime. Serve over rice with sliced chilli.'],
  l:'Curry over rice in one container. Squeeze extra lime over when reheating.',
  g:'Naturally gluten free, but check the curry paste and fish sauce labels.'},

 {id:'souvlaki',n:'Pork Souvlaki & Chips',c:'Fakeaway',t:50,d:'Lemon-oregano pork, tzatziki, Greek salad, chips and warm pita.',
  i:[['pork_shoulder',250],['oregano',1],['lemon',.35],['garlic',.12],['yoghurt',50],['cucumber',.3],['mint',.05],['cherrytom',60],['red_onion',.15],['fetta',25],['pita',1.2],['potato',220]],
  m:['Cut the pork into 3cm cubes. Toss with the oregano, juice of half the lemons, half the garlic, a glug of oil and 1 tsp salt. Leave 20 minutes, then thread onto skewers if you have them.','Chips: heat oven to 220°C. Cut potatoes into wedges, toss with oil and salt, roast 35 to 40 minutes, turning once.','Tzatziki: grate half the cucumber, squeeze out the water, and stir into the yoghurt with the rest of the garlic, chopped mint, lemon and salt.','Greek salad: chop the rest of the cucumber, the tomatoes and red onion, crumble over the fetta, dress with oil and lemon.','Grill pan or BBQ the pork 8 to 10 minutes, turning, until charred and cooked through.','Warm the pita. Everyone builds their own.'],
  l:'Pack pork, salad and tzatziki separately. Skip the chips and double the salad.',
  g:'GF wraps instead of pita. Everything else is naturally gluten free.'},

 {id:'smash',n:'Smash Burgers & Chips',c:'Fakeaway',t:45,d:'Crispy-edged smashed patties with cheese, pickles and special sauce, plus proper chips.',
  i:[['beef_mince',220],['slices',2],['buns',1],['pickles',15],['onion',30],['mayo',15],['ketchup',8],['mustard',4],['cos',.1],['potato',250]],
  m:['Chips: oven to 220°C. Cut potatoes into chips, toss with oil and salt, roast 35 to 40 minutes, turning once.','Special sauce: mayo, tomato sauce, mustard and a spoonful of chopped pickles.','Roll the mince into 110g balls (two per person). Slice the onion paper thin.','Get a heavy pan or BBQ plate smoking hot. Add a ball, smash it flat with a spatula, season hard. Cook 2 minutes until the edge is deep brown.','Flip, add a cheese slice, cook 1 minute more. Stack two patties per burger.','Toast the buns. Sauce, lettuce, double patty, pickles, onion. Done.'],
  l:'Burger bowl: patties over shredded lettuce and leftover rice or chips, sauce in a little container.',
  g:'GF buns, toasted separately. Cook the GF patties first on a clean surface. Check the mustard and pickle labels.'},

 {id:'parma',n:'Chicken Parmas, Chips & Salad',c:'Pub classics',t:60,d:'Crumbed chicken with napoli, ham and melted cheese. The pub classic, at home.',
  i:[['chk_breast',250],['flour',10],['eggs',.4],['panko',30],['passata',70],['oregano',.3],['ham',30],['mozz',40],['potato',250],['cos',.15],['cucumber',.2],['lemon',.1]],
  m:['Chips: oven to 220°C. Cut potatoes into chips, toss with oil and salt, roast 35 to 40 minutes.','Slice the breasts in half horizontally so they cook evenly. Set up flour, beaten egg and crumbs.','Crumb every piece. Do the GF ones first in their own flour, egg and crumbs.','Shallow-fry 3 minutes a side until golden. Move to a lined tray.','Napoli: passata with oregano and salt. Spoon over each schnitzel, top with ham and mozzarella.','Bake 10 minutes until bubbling. Serve with chips and a simple lettuce, cucumber and lemon salad.'],
  l:'Slice the parma into strips and pack with salad. Reheat in the oven or air fryer, never the microwave, to keep it crunchy.',
  g:'GF flour and breadcrumbs, crumbed first and fried in fresh oil or a separate pan. Check the ham.'},

 {id:'bun',n:'Vietnamese Pork Noodle Salad',c:'Bowls',t:35,d:'Lemongrass pork over vermicelli with herbs, crunchy veg, peanuts and nuoc cham.',
  i:[['pork_mince',240],['lemongrass',8],['fishsauce',14],['brownsugar',10],['garlic',.12],['vermicelli',80],['cos',.15],['cucumber',.25],['carrot',50],['mint',.1],['coriander',.1],['peanuts',15],['lime',.35],['chilli',.3]],
  m:['Pork: mix the mince with lemongrass paste, half the garlic, half the fish sauce, half the sugar and pepper. Roll into small flat patties.','Nuoc cham: the rest of the fish sauce and sugar with lime juice, the rest of the garlic, sliced chilli and 2 tbsp water per serve. Taste: it should be salty, sweet and sour.','Cook the vermicelli per the packet (usually 3 to 4 minutes), rinse under cold water and drain well.','Pan-fry the patties in a hot pan 3 minutes a side until caramelised.','Prep the salad: shredded lettuce, cucumber and carrot matchsticks, a pile of mint and coriander, crushed peanuts.','Bowls: noodles, salad, pork, herbs and peanuts. Pour the nuoc cham over at the table.'],
  l:'A great cold lunch. Pack the dressing separately and pour it on just before eating.',
  g:'Naturally gluten free with rice noodles. Check the fish sauce label.'},

 {id:'chorizo',n:'Spicy Chorizo & Chicken Pasta',c:'Pasta',t:45,d:'Crispy chorizo and chicken in a smoky, creamy tomato sauce with spinach and parmesan.',
  i:[['chorizo',100],['chk_thigh',130],['onion',40],['capsicum',.2],['garlic',.1],['smokedpaprika',1],['chilliflakes',.3],['tompaste',15],['tintom',120],['cream',30],['spinach',20],['pasta',120],['parm',15],['parsley',.05]],
  m:['Fry the sliced chorizo in a dry pan until crispy and the oil runs red. Remove and keep the oil.','Season and brown the bite-size chicken in the chorizo oil. Set aside.','Cook the onion and capsicum 8 minutes. Add the garlic, paprika, chilli and tomato paste for 2 minutes.','Add the crushed tomatoes and chicken and simmer 20 minutes.','Stir in the cream and spinach, add the chorizo back and season.','Cook the regular and GF pasta separately, toss each with the sauce, top with parmesan and parsley.'],
  l:'Keep a mug of pasta water to loosen the sauce when reheating.',
  g:'GF pasta in its own pot. Check the chorizo label; most are GF but not all.'},

 {id:'salmonbowl',n:'Japanese Salmon Rice Bowls',c:'Bowls',t:30,d:'Glazed salmon, seasoned rice, edamame, cucumber, avo and sriracha mayo.',
  i:[['salmon',200],['soy',20],['mirin',10],['honey',8],['ginger',4],['rice',95],['ricevinegar',8],['cucumber',.3],['avocado',.3],['edamame',60],['mayo',15],['sriracha',5],['springonion',.1],['sesameseeds',2]],
  m:['Cook the rice, then stir through the rice vinegar and a pinch of sugar and salt while it\'s hot.','Glaze: soy, mirin, honey and grated ginger.','Cook the edamame in boiling water for 3 minutes and drain.','Pat the salmon dry. Skin side down in a hot oiled pan for 4 minutes until crispy, flip for 2 minutes.','Pour in the glaze and let it bubble 1 minute, spooning it over the fish.','Bowls: rice, salmon, edamame, sliced cucumber and avo. Drizzle sriracha mayo, finish with spring onion and sesame seeds.'],
  l:'Flake the salmon over rice and pack the avo and mayo separately. Eat cold or barely warm.',
  g:'Tamari instead of soy in the glaze, cooked in a separate pan. Mirin is usually GF but check it.'},

 {id:'friedrice',n:'Chicken Fried Rice',c:'Bowls',t:30,d:'Better than takeaway: smoky wok-fried rice with chicken, egg and veg.',
  i:[['chk_thigh',200],['eggs',1],['rice',110],['peas',50],['carrot',40],['springonion',.2],['garlic',.1],['ginger',4],['soy',20],['oyster',8],['sesameoil',4]],
  m:['Best with rice cooked the day before and chilled. If not, cook it early, spread on a tray and fridge it for an hour.','Slice the chicken small, toss with a splash of soy, and stir-fry in a very hot wok until cooked. Set aside.','Scramble the eggs softly, then set aside.','Stir-fry the diced carrot 2 minutes, then the garlic, ginger and white parts of the spring onion for 30 seconds.','Add the rice, press it into the wok and leave it 1 minute to toast before tossing. Repeat a few times.','Add the peas, chicken, egg, soy and oyster sauce. Toss hot for 2 minutes, finish with sesame oil and green spring onion.'],
  l:'Built for lunch. Reheat until piping hot.',
  g:'Make the whole batch with tamari, and use a GF oyster sauce or skip it. Rice dishes are where hidden gluten sneaks in.'},

 {id:'roastpork',n:'Roast Pork with Crackling',c:'Roasts',t:180,h:30,d:'Crunchy crackling, roast veg, gravy and a sharp apple slaw.',
  i:[['pork_roast',300],['potato',200],['swpotato',120],['carrot',60],['cabbage',.1],['apple',.3],['mayo',10],['stockpowder',3],['cornflour',3]],
  m:['Pat the rind bone dry (leave it uncovered in the fridge overnight if you can). Score it, rub with oil and plenty of salt.','Roast at 240°C for 30 minutes until the rind blisters, then drop to 170°C for 2 hours.','Cut the veg into chunks, toss in oil and salt, and roast below the pork for the last hour.','If the crackling isn\'t crunchy, put the pork under the grill for 5 minutes and watch it closely.','Rest the pork 15 minutes. Gravy: pan juices plus stock powder dissolved in water, thickened with cornflour mixed into a little cold water.','Slaw: shredded cabbage and apple matchsticks tossed with mayo, a squeeze of lemon if you have one, and salt.'],
  l:'Pork and veg together, gravy in a little container. Pork and slaw rolls work well too.',
  g:'Use 100% maize cornflour (not "wheaten") and check the stock powder. Everything else is naturally GF.'},

 {id:'kraprao',n:'Thai Basil Pork with Fried Egg',c:'Bowls',t:25,d:'Pad kra pao: garlicky, chilli-hot pork mince with Thai basil and a crispy fried egg.',
  i:[['pork_mince',230],['garlic',.12],['chilli',.5],['oyster',10],['soy',10],['fishsauce',6],['brownsugar',4],['greenbeans',60],['thaibasil',.2],['eggs',1],['rice',95]],
  m:['Cook the rice.','Pound or finely chop the garlic and chilli together.','Fry the garlic and chilli in a hot wok for 30 seconds. Add the mince and stir-fry hard, breaking it up, until browned and a little crispy.','Add the sliced beans, then the oyster sauce, soy, fish sauce and sugar. Toss 2 minutes.','Off the heat, stir through a big handful of Thai basil until it wilts.','Fry the eggs in plenty of hot oil until the edges are crispy and the yolk\'s still runny. Serve over rice.'],
  l:'Pork over rice. Skip the egg for lunch or pack a boiled one.',
  g:'Tamari instead of soy and a GF oyster sauce, cooked in a separate wok. Check the fish sauce.'},

 {id:'bake',n:'Beef & Tomato Pasta Bake',c:'Pasta',t:50,d:'Rich beef and veg sauce baked through pasta under a thick layer of melted cheese.',
  i:[['beef_mince',220],['onion',40],['garlic',.08],['capsicum',.2],['zucchini',60],['tompaste',15],['tintom',150],['oregano',.5],['pasta',110],['cheese',40],['mozz',20]],
  m:['Brown the mince hard in a big pan. Add the diced onion, capsicum and zucchini and cook 8 minutes.','Add the garlic, oregano and tomato paste for 2 minutes, then the crushed tomatoes. Simmer 15 minutes and season.','Meanwhile cook the pasta 2 minutes short of the packet time. Drain.','Heat oven to 200°C. Mix the pasta through the sauce and tip into a baking dish.','Cover with the cheese and mozzarella. Bake 20 minutes until golden and bubbling.','Rest 5 minutes before serving.'],
  l:'Cut into squares once it cools. Reheats like a dream.',
  g:'Make the GF portion in its own smaller dish with GF pasta.'},

 {id:'tuscan',n:'Creamy Tuscan Chicken Pasta',c:'Pasta',t:35,d:'Golden chicken in a garlicky cream sauce with sun-dried tomatoes, spinach and parmesan.',
  i:[['chk_thigh',220],['garlic',.1],['sundried',30],['cream',60],['parm',15],['spinach',25],['stockpowder',2],['oregano',.3],['pasta',120]],
  m:['Season the thighs and sear 5 to 6 minutes a side until golden. Rest, then slice.','Same pan: garlic and sliced sun-dried tomatoes for 1 minute.','Add the cream, stock powder dissolved in ¼ cup water, and oregano. Simmer 3 minutes.','Stir in the parmesan and spinach until wilted. Add the chicken back.','Cook the pasta, keep some pasta water, and toss through the sauce.'],
  l:'Pasta water or a splash of milk brings the sauce back when reheating.',
  g:'GF pasta in a separate pot. Check the stock powder.'},

 {id:'chook',n:'Roast Chook, Crispy Potatoes & Gravy',c:'Roasts',t:100,d:'Lemon and garlic roast chicken, crunchy potatoes, greens and proper gravy.',
  i:[['chk_whole',450],['lemon',.15],['garlic',.1],['butter',10],['potato',300],['carrot',80],['greenbeans',80],['stockpowder',3],['cornflour',3]],
  m:['Oven to 200°C. Rub the birds with butter, crushed garlic and salt. Lemon halves inside.','Roast about 1 hour 20 minutes for a 1.8kg bird, until the juices run clear.','Parboil chunked potatoes 8 minutes, drain, shake to rough them up, and roast in oil alongside for 50 minutes with the carrots.','Rest the chooks 10 minutes. Steam the beans.','Gravy: pan juices plus stock powder dissolved in water, thickened with cornflour mixed into a little cold water.','Carve and serve.'],
  l:'Strip the leftover meat and pack it with potatoes and greens. Spare gravy in a little container.',
  g:'Use 100% maize cornflour and check the stock powder. Naturally GF otherwise.'},

 {id:'lamb',n:'Slow-Roast Lamb, Smashed Potatoes',c:'Roasts',t:210,h:25,d:'Garlic and oregano lamb shoulder roasted until it pulls apart, with crispy smashed potatoes.',
  i:[['lamb_sh',320],['garlic',.12],['oregano',1],['lemon',.2],['potato',250],['yoghurt',40],['mint',.08],['cos',.12],['cucumber',.2]],
  m:['Oven to 160°C. Stab the lamb all over and rub with crushed garlic, oregano, lemon zest, oil and salt.','Roast covered with a cup of water for 3 hours until it pulls apart.','Meanwhile boil the potatoes whole for 15 minutes until tender. Drain and cool.','Rest the lamb covered. Turn the oven to 220°C. Smash the potatoes flat on an oiled tray, oil and salt the tops, roast 30 minutes until crispy.','Mint yoghurt: yoghurt, chopped mint, lemon juice and salt. Salad: lettuce and cucumber with lemon and oil.','Shred the lamb and serve with everything.'],
  l:'Lamb, potatoes and salad in one container, yoghurt on the side.',
  g:'Naturally gluten free.'},

 {id:'lasagne',n:'Beef & Bacon Lasagne',c:'Pasta',t:90,d:'Slow-simmered beef and bacon ragu layered with a proper cheesy white sauce.',
  i:[['beef_mince',200],['bacon',30],['onion',50],['carrot',40],['garlic',.08],['tompaste',15],['tintom',150],['oregano',.5],['lasagne',70],['butter',12],['flour',12],['milk',150],['cheese',40],['parm',10]],
  m:['Soften the diced onion, carrot, garlic and bacon. Add the mince and brown well.','Stir in the tomato paste for 2 minutes, then the crushed tomatoes and oregano. Simmer 25 minutes until thick.','White sauce: melt the butter, stir in the flour for 1 minute, then whisk in the milk bit by bit until thick. Season and stir in half the cheese.','Layer ragu, sheets and white sauce three times. Top with the rest of the cheese and the parmesan.','Bake at 180°C fan for 35 to 40 minutes. Rest 10 minutes before cutting.'],
  l:'Cut into portions once cool. One of the best reheat lunches there is.',
  g:'A separate smaller GF lasagne with GF sheets and white sauce made with GF flour. Check the bacon.'},

 {id:'burrito',n:'Chicken Burrito Bowls',c:'Bowls',t:35,d:'Smoky chicken, lime-coriander rice, black beans, corn salsa, cheese and crema.',
  i:[['chk_thigh',240],['smokedpaprika',1],['cumin',1],['oregano',.4],['garlic',.08],['lime',.4],['rice',90],['coriander',.12],['blackbeans',100],['corn',60],['cherrytom',50],['red_onion',.1],['jalapenos',8],['cheese',25],['sourcream',30],['avocado',.3]],
  m:['Rub the chicken with the paprika, cumin, oregano, garlic, oil and salt. Leave 15 minutes.','Cook the rice. Stir through lime juice and chopped coriander.','Cook the chicken 5 to 6 minutes a side until charred. Rest and slice.','Warm the drained black beans with a pinch of cumin and salt.','Salsa: corn, chopped tomatoes, red onion, jalapeño, lime and coriander.','Build bowls: rice, beans, chicken, salsa, cheese, sour cream and avocado.'],
  l:'Built for lunch. Keep the sour cream and avo separate until eating.',
  g:'Naturally gluten free. Check the spice labels.'},

 {id:'risotto',n:'Garlic Prawn & Chorizo Risotto',c:'Pasta',t:45,d:'Creamy risotto with crispy chorizo, garlic prawns, peas and roasted tomatoes.',
  i:[['prawns',150],['chorizo',50],['onion',40],['garlic',.1],['arborio',100],['stockpowder',4],['cherrytom',50],['peas',50],['parm',15],['butter',10],['lemon',.1],['parsley',.05]],
  m:['Roast the cherry tomatoes at 200°C with oil and salt for 15 minutes.','Make the stock: stock powder dissolved in 350ml hot water per serve. Keep it warm.','Fry the sliced chorizo until crisp, remove. Soften the onion in the chorizo oil 3 minutes, add half the garlic, then the rice. Toast 1 minute.','Add stock a ladle at a time, stirring, for 18 to 20 minutes until creamy.','Meanwhile sizzle the prawns with the rest of the garlic, 2 minutes a side. Add them and the peas for the last 3 minutes.','Off the heat, stir in butter, parmesan and lemon. Top with chorizo, tomatoes and parsley.'],
  l:'Reheat with a splash of water and stir well. Prawns are best eaten within a day.',
  g:'Naturally gluten free. Check the stock powder and chorizo.'},

 {id:'chickpea',n:'Chickpea, Spinach & Coconut Curry',c:'Curry',t:35,d:'A big, cheap, warming veg curry with yoghurt and naan.',
  i:[['chickpeas',300],['currypaste',30],['onion',50],['garlic',.08],['ginger',5],['coconut',100],['tintom',100],['spinach',40],['rice',90],['yoghurt',40],['naan',.5],['coriander',.1]],
  m:['Cook the rice.','Soften the onion 8 minutes, add the garlic and ginger for 1 minute, then the curry paste for 2 minutes.','Add the tomatoes, coconut milk and drained chickpeas. Simmer 15 minutes, crushing some chickpeas to thicken it.','Stir through the spinach until wilted. Season with salt and a squeeze of lemon if you have one.','Serve with rice, yoghurt, naan and coriander.'],
  l:'Freezes and reheats well. Great for a meat-free day.',
  g:'GF wraps or extra rice instead of naan, and check the curry paste.'},
 {id:'honeygarlic',n:'Honey Garlic Chicken & Greens',c:'Bowls',t:30,d:'Crispy-edged chicken in a sticky honey, garlic and soy glaze with charred broccoli and rice.',
  i:[['chk_thigh',250],['honey',15],['soy',20],['garlic',.15],['ginger',5],['ricevinegar',5],['cornflour',4],['broccoli',120],['rice',95],['springonion',.1],['sesameseeds',2]],
  m:['Cook the rice.','Cut the chicken into bite-size pieces, season with salt and pepper and toss in the cornflour so it\'s lightly coated.','Glaze: honey, soy, rice vinegar, grated garlic and ginger, plus 2 tbsp water per serve.','Fry the chicken in a hot pan with a good splash of oil, in batches, 6 to 7 minutes until golden and crisp on the edges.','Meanwhile cut the broccoli into small florets and char in a separate hot pan with a little oil for 4 minutes, then add a splash of water and cover for 2 minutes.','Pour the glaze over the chicken and bubble 2 minutes, tossing, until thick and sticky.','Serve over rice with the broccoli, spring onion and sesame seeds.'],
  l:'Chicken, broccoli and rice in one container. The glaze keeps it juicy when reheated.',
  g:'Tamari instead of soy, and make sure the cornflour is 100% maize. Cook the GF batch first in a clean pan.'},

 {id:'massaman',n:'Slow-Cooked Beef Massaman',c:'Curry',t:180,h:25,d:'Chuck braised in a rich, peanutty massaman with potatoes until it falls apart.',
  i:[['beef_chuck',250],['massaman',35],['coconut',160],['potato',150],['onion',50],['fishsauce',8],['brownsugar',6],['peanuts',15],['lime',.15],['rice',95],['coriander',.1]],
  m:['Cut the chuck into large 4cm chunks, season with salt and brown hard in a heavy pot in batches. Set aside.','Lower the heat, add a splash of oil and fry the curry paste for 2 minutes until fragrant.','Add the coconut milk, half a cup of water per 2 serves, the fish sauce and brown sugar. Return the beef and bring to a gentle simmer.','Lid on, low heat (or 160°C oven) for 2 hours, stirring occasionally.','Add the potato in chunks and the onion in wedges. Simmer uncovered 30 to 40 minutes until the potato is tender and the beef falls apart.','Taste: adjust with more fish sauce for salt, sugar for sweet, lime for sour. Cook the rice.','Serve over rice, topped with crushed peanuts and coriander.'],
  l:'Even better the next day. Pack the peanuts separately so they stay crunchy.',
  g:'Naturally gluten free. Check the curry paste and fish sauce labels.'},

 {id:'katsu',n:'Chicken Katsu Curry',c:'Fakeaway',t:50,d:'Crunchy panko chicken with a from-scratch Japanese curry sauce, rice and a sharp cabbage salad.',
  i:[['chk_thigh',240],['flour',18],['eggs',.4],['panko',35],['onion',50],['carrot',60],['garlic',.08],['ginger',4],['currypowder',4],['stockpowder',3],['honey',6],['soy',8],['rice',95],['cabbage',.1],['ricevinegar',6]],
  m:['Curry sauce: soften the diced onion and carrot in a little oil for 8 minutes. Add the garlic, ginger and curry powder for 1 minute.','Stir in half the flour for 1 minute, then whisk in the stock powder dissolved in ¾ cup hot water per serve. Simmer 15 minutes, add the honey and soy, then blitz smooth.','Cook the rice. Slaw: shred the cabbage thin and toss with the rice vinegar and a pinch of salt and sugar.','Flatten the thighs a little. Dust in the remaining flour, dip in beaten egg, press into the panko.','Shallow-fry in 1cm of oil, 4 minutes a side, until deep golden and cooked through. Drain and rest 2 minutes, then slice.','Plate the rice, chicken and slaw, and pour the curry sauce alongside.'],
  l:'Keep the sauce separate and reheat the chicken in the oven or air fryer so it stays crunchy.',
  g:'GF flour in the sauce (make a small separate pot) and for crumbing, with GF crumbs. Tamari instead of soy. Fry the GF chicken first in fresh oil.'},

 {id:'greektray',n:'Greek Lemon Chicken Tray Bake',c:'Roasts',t:60,d:'One-tray lemon, garlic and oregano chicken with crispy potatoes, tomatoes, fetta and tzatziki.',
  i:[['chk_thigh',250],['potato',250],['lemon',.4],['garlic',.15],['oregano',1.2],['red_onion',.25],['cherrytom',70],['fetta',25],['yoghurt',40],['cucumber',.2],['parsley',.05]],
  m:['Oven to 220°C. Cut the potatoes into wedges, toss with oil, salt and half the oregano and roast 20 minutes.','Meanwhile toss the chicken with the juice and zest of most of the lemons, half the garlic (crushed), the rest of the oregano, oil and salt.','Add the chicken and the red onion wedges to the tray, turn the potatoes, and roast another 20 minutes.','Add the tomatoes and roast 10 minutes more until the chicken is golden and the tomatoes burst.','Tzatziki: grated cucumber (water squeezed out), yoghurt, the rest of the garlic, a squeeze of lemon and salt.','Crumble the fetta over the tray, scatter parsley, and serve with the tzatziki.'],
  l:'Everything in one container with the tzatziki on the side.',
  g:'Naturally gluten free.'},

 {id:'mongolian',n:'Mongolian Beef',c:'Fakeaway',t:30,d:'Thin, crispy beef tossed in a sweet, garlicky soy sauce with broccoli and spring onions.',
  i:[['beef_rump',230],['cornflour',8],['soy',25],['brownsugar',12],['garlic',.15],['ginger',6],['springonion',.25],['broccoli',100],['rice',95],['sesameoil',3]],
  m:['Cook the rice.','Slice the beef as thin as you can across the grain (freeze it for 20 minutes first to make this easy). Toss in the cornflour.','Sauce: soy, brown sugar and 3 tbsp water per serve.','Fry the beef in a very hot wok with plenty of oil, in small batches, 1 to 2 minutes until crisp. Drain.','Pour out most of the oil. Fry the garlic and ginger 30 seconds, add the broccoli and a splash of water, and cook 3 minutes.','Pour in the sauce and bubble until it thickens, then toss the beef and spring onions through. Finish with sesame oil and serve over rice.'],
  l:'Beef, broccoli and rice together. Reheat until hot.',
  g:'Tamari instead of soy, 100% maize cornflour, and a separate clean wok for the GF batch.'},

 {id:'tandoori',n:'Tandoori Chicken, Raita & Rice',c:'Curry',t:45,d:'Charred yoghurt-marinated chicken with cooling mint raita, pickled onions, rice and naan.',
  i:[['chk_thigh',260],['yoghurt',90],['currypaste',20],['garammasala',1.5],['lemon',.3],['garlic',.1],['cucumber',.25],['mint',.1],['red_onion',.2],['whitevinegar',8],['rice',95],['naan',.5]],
  m:['Marinade: half the yoghurt with the curry paste, garam masala, half the garlic, the juice of half the lemons and 1 tsp salt. Coat the chicken and leave at least 30 minutes (overnight is best).','Pickled onion: thinly sliced red onion with the vinegar, a pinch of sugar and salt.','Raita: the rest of the yoghurt with grated cucumber, chopped mint, the rest of the garlic and salt.','Cook the rice.','Grill or pan-fry the chicken on high, 5 to 6 minutes a side, until charred at the edges and cooked through. Rest 5 minutes.','Serve with rice, warm naan, raita, pickled onion and lemon wedges.'],
  l:'Chicken over rice with the raita in a separate container.',
  g:'GF wraps or extra rice instead of naan. Check the curry paste label.'},

 {id:'nachos',n:'Loaded Beef Nachos',c:'Fakeaway',t:35,d:'Spiced beef and beans under melted cheese, with guacamole, salsa, sour cream and jalapeños.',
  i:[['beef_mince',200],['onion',40],['garlic',.08],['cumin',1.2],['smokedpaprika',1],['chillipowder',.5],['oregano',.4],['tompaste',12],['tintom',100],['blackbeans',80],['cornchips',70],['cheese',50],['avocado',.4],['lime',.25],['cherrytom',50],['red_onion',.1],['coriander',.1],['sourcream',30],['jalapenos',10]],
  m:['Brown the mince hard in a big pan. Add the diced onion and cook 5 minutes, then the garlic and all the spices for 1 minute.','Stir in the tomato paste, crushed tomatoes and drained beans. Simmer 10 minutes until thick and season well.','Guacamole: mash the avocado with lime juice, salt and some chopped coriander. Salsa: chopped tomatoes, red onion, coriander and lime.','Oven to 200°C. Spread the corn chips on trays, spoon over the beef and cover with cheese.','Bake 8 to 10 minutes until the cheese is melted and bubbling.','Top with guac, salsa, sour cream and jalapeños and get it on the table fast.'],
  l:'Pack the beef with rice instead of chips (burrito bowl style), toppings on the side.',
  g:'Plain corn chips are usually gluten free, but check the bag. Check the spices too.'},

 {id:'padthai',n:'Chicken Pad Thai',c:'Bowls',t:35,d:'Flat rice noodles wok-tossed with chicken, egg, bean sprouts and peanuts in a sweet-sour sauce.',
  i:[['chk_thigh',200],['ricenoodles',90],['eggs',1],['beansprouts',50],['springonion',.2],['garlic',.1],['fishsauce',15],['brownsugar',12],['ketchup',10],['lime',.35],['peanuts',20],['chilliflakes',.3]],
  m:['Soak the noodles in hot (not boiling) water for 15 minutes until bendy but still firm. Drain.','Sauce: fish sauce, brown sugar, tomato sauce, the juice of half the limes and 1 tbsp water per serve. Stir until the sugar dissolves.','Slice the chicken thin and stir-fry in a very hot wok until cooked. Push to one side.','Add the garlic, then crack in the eggs and scramble them into the chicken.','Add the noodles and sauce and toss constantly for 2 to 3 minutes until the sauce is absorbed. Cook in two batches if your wok is small.','Toss through the bean sprouts and spring onion. Serve with crushed peanuts, chilli flakes and lime wedges.'],
  l:'Reheat with a splash of water so the noodles loosen up. Fresh lime over the top brings it back.',
  g:'Naturally gluten free with rice noodles. Check the fish sauce and tomato sauce labels.'},

 {id:'cottage',n:'Cottage Pie',c:'Comfort',t:75,d:'Rich beef and veg in gravy under a thick, golden layer of cheesy mash.',
  i:[['beef_mince',220],['onion',50],['carrot',60],['garlic',.08],['tompaste',15],['worcestershire',8],['stockpowder',3],['peas',40],['cornflour',3],['potato',300],['butter',15],['milk',40],['cheese',30]],
  m:['Mash: boil the peeled potatoes 15 to 18 minutes until soft. Drain and mash with the butter, milk and salt.','Brown the mince hard in a big pan. Add the diced onion and carrot and cook 8 minutes.','Stir in the garlic and tomato paste for 2 minutes, then the Worcestershire and stock powder dissolved in ½ cup water per serve.','Simmer 15 minutes. Add the peas, and thicken with the cornflour mixed into a little cold water. Season well.','Oven to 200°C. Spoon the beef into a baking dish, spread the mash on top, rough it up with a fork and cover with cheese.','Bake 25 minutes until golden and bubbling at the edges. Rest 5 minutes.'],
  l:'Cut into portions once cool. Reheats perfectly.',
  g:'Check the Worcestershire sauce (some aren\'t GF), the stock powder and the cornflour (100% maize).'},

 {id:'chilli',n:'Chilli Con Carne',c:'Comfort',t:60,d:'Smoky beef and bean chilli with rice, sour cream, cheese and fresh coriander.',
  i:[['beef_mince',220],['onion',50],['capsicum',.3],['garlic',.1],['cumin',1.5],['smokedpaprika',1.5],['chillipowder',.8],['oregano',.4],['cinnamon',.2],['tompaste',15],['tintom',150],['blackbeans',100],['rice',90],['sourcream',30],['cheese',25],['coriander',.1],['lime',.15]],
  m:['Brown the mince hard in a heavy pot. Add the diced onion and capsicum and cook 8 minutes.','Add the garlic and all the spices and cook 1 minute until fragrant.','Stir in the tomato paste for 2 minutes, then the crushed tomatoes, drained beans and ½ cup water per 2 serves.','Simmer low for 30 to 40 minutes, stirring now and then, until rich and thick. Season with salt and a squeeze of lime.','Cook the rice.','Serve the chilli over rice with sour cream, cheese and coriander.'],
  l:'One of the best lunches there is. It freezes well too.',
  g:'Naturally gluten free. Check the spice labels.'},

 {id:'periperi',n:'Peri Peri Chicken, Chips & Slaw',c:'Fakeaway',t:55,d:'Fiery, lemony charred chicken with crunchy chips and a creamy slaw.',
  i:[['chk_thigh',260],['chilli',.6],['garlic',.12],['smokedpaprika',1.5],['oregano',.5],['lemon',.35],['whitevinegar',8],['brownsugar',3],['potato',250],['cabbage',.12],['carrot',50],['mayo',20]],
  m:['Peri peri sauce: blitz the chillies, garlic, paprika, oregano, lemon juice, vinegar, sugar, a glug of oil and 1 tsp salt. Keep a few spoonfuls aside for serving.','Coat the chicken in the rest and marinate at least 20 minutes.','Chips: oven to 220°C. Cut potatoes into chips, toss with oil and salt, roast 35 to 40 minutes, turning once.','Slaw: shredded cabbage and grated carrot with mayo, a squeeze of lemon and salt.','Grill pan, BBQ or hot oven tray: cook the chicken 5 to 6 minutes a side until charred and cooked through.','Serve with chips and slaw, and the extra sauce for the brave.'],
  l:'Chicken and slaw in a wrap, or over rice. Skip the chips.',
  g:'Naturally gluten free. Check the mayo label.'},

 {id:'kofta',n:'Lamb Kofta, Hummus & Flatbread',c:'Bowls',t:40,d:'Spiced lamb kofta with hummus, Israeli salad, yoghurt and warm flatbreads.',
  i:[['lamb_mince',220],['onion',30],['garlic',.08],['cumin',1.2],['cinnamon',.3],['parsley',.15],['hummus',50],['pita',1.2],['cucumber',.3],['cherrytom',70],['red_onion',.12],['lemon',.25],['yoghurt',40]],
  m:['Kofta: mix the lamb with finely grated onion, garlic, cumin, cinnamon, half the chopped parsley and 1 tsp salt. Shape into small sausages, about 3 per serve.','Chill 15 minutes so they hold together.','Salad: finely diced cucumber, tomato and red onion with the rest of the parsley, lemon juice, oil and salt.','Cook the kofta on a hot grill pan or BBQ, 8 to 10 minutes, turning, until charred and cooked through.','Warm the flatbreads.','Spread hummus on each plate, add the kofta, salad, a spoon of yoghurt and flatbread on the side.'],
  l:'Kofta, salad and hummus in one container, bread on the side.',
  g:'GF wraps instead of flatbread. Check the hummus label.'},

 {id:'porkbelly',n:'Sticky Pork Belly Bowls',c:'Bowls',t:60,d:'Crispy pork belly bites in a sticky soy-honey glaze with rice, greens and pickled cucumber.',
  i:[['pork_belly',220],['soy',20],['honey',15],['garlic',.1],['ginger',5],['broccoli',100],['cucumber',.25],['ricevinegar',8],['rice',95],['springonion',.1],['sesameseeds',2]],
  m:['Oven to 220°C. Cut the belly into 2cm cubes, toss with salt and spread on a lined tray.','Roast 35 to 40 minutes, turning once, until crisp and rendered. Drain off the fat.','Cook the rice. Quick pickle: thin cucumber slices with rice vinegar and a pinch of salt and sugar.','Glaze: soy, honey, grated garlic and ginger.','Toss the pork in a hot pan with the glaze for 2 to 3 minutes until sticky and glossy.','Steam the broccoli. Build bowls with rice, pork, broccoli and pickles, and finish with spring onion and sesame seeds.'],
  l:'Pork and rice together, pickles in a separate container.',
  g:'Tamari instead of soy, glazed in a separate pan.'},

 {id:'steaksanga',n:'Steak Sangas & Chips',c:'Pub classics',t:45,d:'Seared rump on toasted Turkish with sticky caramelised onions, cheese and chips.',
  i:[['beef_rump',200],['onion',80],['brownsugar',5],['whitevinegar',5],['turkish',1],['slices',1],['cos',.1],['cherrytom',40],['mayo',15],['potato',230]],
  m:['Chips: oven to 220°C. Cut potatoes into chips, toss with oil and salt, roast 35 to 40 minutes.','Caramelised onions: slice the onions thin and cook low in oil with a pinch of salt for 20 minutes, stirring often, until deep golden. Add the sugar and vinegar for the last 2 minutes.','Bash the steaks to about 1cm thick and season well.','Sear in a smoking hot pan, 1 to 2 minutes a side. Rest 3 minutes, then slice.','Split and toast the Turkish rolls. Melt a cheese slice on the steak in the pan.','Build: mayo, lettuce, sliced tomato, steak and cheese, plenty of onions. Serve with chips.'],
  l:'Steak and onions over salad, or in a wrap. Keep the bread separate so it doesn\'t go soggy.',
  g:'GF buns instead of Turkish rolls, toasted separately.'},

 {id:'meatballs',n:'Spaghetti & Meatballs',c:'Pasta',t:60,d:'Big, juicy beef and pork meatballs simmered in tomato sauce, over pasta with parmesan.',
  i:[['beef_mince',130],['pork_mince',100],['panko',20],['eggs',.25],['parm',20],['garlic',.12],['onion',40],['passata',180],['tintom',100],['oregano',.5],['pasta',120],['parsley',.05]],
  m:['Meatballs: mix both minces with the panko, egg, half the parmesan, half the garlic (crushed), chopped parsley and 1 tsp salt. Roll into golf-ball sizes, about 5 per serve.','Brown the meatballs all over in a big pan with a little oil. Set aside.','Same pan: soften the diced onion 5 minutes, then the rest of the garlic and the oregano for 1 minute.','Add the passata and crushed tomatoes, return the meatballs and simmer, half covered, 20 minutes.','Cook the pasta, keep a mug of the water, and toss with some sauce.','Serve the meatballs and sauce over pasta with the rest of the parmesan.'],
  l:'Meatballs and sauce reheat beautifully. Use the pasta water to loosen it.',
  g:'GF crumbs in a separate small batch of meatballs, cooked first, and GF pasta in its own pot.'},

 {id:'fishtacos',n:'Crispy Fish Tacos',c:'Fakeaway',t:35,d:'Spiced crispy fish in warm tortillas with lime slaw, sriracha mayo and avocado.',
  i:[['whitefish',220],['flour',15],['smokedpaprika',1],['cumin',.6],['tortillas',2.5],['cabbage',.1],['lime',.4],['mayo',20],['sriracha',6],['avocado',.3],['coriander',.12],['sourcream',20]],
  m:['Slaw: shred the cabbage thin and toss with the juice of half the limes, coriander and salt.','Sauce: mayo, sriracha, sour cream and a squeeze of lime.','Cut the fish into fingers. Mix the flour with the paprika, cumin and 1 tsp salt, and toss the fish in it.','Shallow-fry in hot oil 2 to 3 minutes a side until golden and flaky. Drain on paper towel.','Warm the tortillas in a dry pan.','Load each taco with slaw, fish, avocado and sauce. Lime wedges on the side.'],
  l:'Turn it into a bowl: fish over rice and slaw, sauce on the side.',
  g:'GF flour for the GF fish (fried first in fresh oil), and corn tortillas.'}
];

// ---------- Meal-kit prices for the Kit Tax ----------
const KITS_DEFAULT=[{n:'HelloFresh',ps:9.50,del:11.99,max:4},{n:'Marley Spoon',ps:9.99,del:10.99,max:4},{n:'Dinnerly',ps:5.99,del:10.99,max:4}];
