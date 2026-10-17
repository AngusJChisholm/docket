// ============================================================================
// Riversdale Fresh recipe library and ingredient prices.
// Prices are Coles estimates (Melbourne, Oct 2026). Woolies and Aldi are derived from these.
// Quantities in recipes are PER SERVE (one dinner portion). The planner scales them.
//
// Ingredient fields:
//   n name · a aisle · u unit (g, ml, ea) · pk pack size · p pack price · pr protein per 100g/ml (or per each)
//   t tag for filters (red, pork, seafood) · pl pack label · ck check the label for gluten
//   alt [pack size, price] a smaller pack the planner can choose · wt sold by weight (buy what you need)
//   whole: always use whole ones (eggs, buns, wraps) · noAldi not stocked at Aldi · pan pantry item (costed by what you use; listed under "Pantry check")
//   Kitchen display: tsp/tbsp = grams per teaspoon/tablespoon · cup = grams per cup
//                    ea = [grams each, "word"] · cl = cloves per bulb
// ============================================================================

const AISLE={M:'Meat & seafood',F:'Fruit & veg',D:'Dairy, eggs & fridge',Z:'Freezer',P:'Pantry & tins',B:'Bakery',G:'Gluten free',K:'Pantry check (buy if you\'re out)'};

const ING={
 // Meat & seafood
 chk_thigh:{n:'Chicken thigh fillets',a:'M',u:'g',pk:1000,p:15.00,pr:20,alt:[500,8.50]},
 chk_breast:{n:'Chicken breast fillets',a:'M',u:'g',pk:1000,p:13.00,pr:23,alt:[500,7.50]},
 chk_whole:{n:'Whole chicken (1.8kg)',a:'M',u:'g',pk:1800,p:13.50,pr:13,pl:'1.8kg bird'},
 beef_mince:{n:'Beef mince (3 star)',a:'M',u:'g',pk:1000,p:14.00,pr:19,t:'red',alt:[500,7.50]},
 beef_lean:{n:'Lean beef mince (5 star)',a:'M',u:'g',pk:500,p:9.00,pr:21,t:'red'},
 beef_rump:{n:'Rump steak',a:'M',u:'g',pk:1000,p:27.00,pr:22,t:'red',wt:1},
 beef_chuck:{n:'Beef chuck (slow cook)',a:'M',u:'g',pk:1000,p:18.00,pr:20,t:'red',wt:1},
 pork_shoulder:{n:'Pork shoulder, boneless',a:'M',u:'g',pk:1000,p:12.00,pr:18,t:'pork',wt:1},
 pork_roast:{n:'Pork shoulder roast, rind on',a:'M',u:'g',pk:1000,p:11.00,pr:16,t:'pork',wt:1},
 pork_mince:{n:'Pork mince',a:'M',u:'g',pk:500,p:7.50,pr:18,t:'pork'},
 lamb_sh:{n:'Lamb shoulder (bone-in)',a:'M',u:'g',pk:1000,p:15.00,pr:15,t:'red'},
 salmon:{n:'Salmon fillets, skin on',a:'M',u:'g',pk:1000,p:36.00,pr:20,t:'seafood',wt:1},
 chorizo:{n:'Chorizo',a:'M',u:'g',pk:250,p:6.00,pr:24,t:'pork',ck:1},
 bacon:{n:'Middle bacon',a:'M',u:'g',pk:250,p:5.50,pr:16,t:'pork'},
 ham:{n:'Shaved ham',a:'M',u:'g',pk:200,p:4.50,pr:18,t:'pork'},

 // Dairy, eggs & fridge
 eggs:{n:'Free-range eggs',a:'D',u:'ea',pk:12,p:6.50,pr:6.5,pl:'dozen',ea:[1,'egg'],alt:[6,4.00],whole:1},
 cream:{n:'Thickened cream',a:'D',u:'ml',pk:600,p:4.50,pr:2,alt:[300,2.80]},
 milk:{n:'Full cream milk',a:'D',u:'ml',pk:2000,p:3.10,pr:3.4,alt:[1000,1.80]},
 butter:{n:'Butter',a:'D',u:'g',pk:250,p:4.50,pr:.8,tbsp:14},
 cheese:{n:'Grated tasty cheese',a:'D',u:'g',pk:700,p:9.00,pr:25,cup:100,alt:[250,4.50]},
 mozz:{n:'Grated mozzarella',a:'D',u:'g',pk:500,p:7.00,pr:22,cup:100,alt:[250,4.20]},
 parm:{n:'Parmesan',a:'D',u:'g',pk:250,p:6.50,pr:35},
 fetta:{n:'Fetta',a:'D',u:'g',pk:200,p:4.50,pr:17},
 slices:{n:'Burger cheese slices (12)',a:'D',u:'ea',pk:12,p:4.50,pr:3.5,pl:'12 pack',ea:[1,'slice'],whole:1},
 sourcream:{n:'Sour cream',a:'D',u:'ml',pk:300,p:2.60,pr:3},
 yoghurt:{n:'Greek yoghurt',a:'D',u:'g',pk:1000,p:6.00,pr:9,cup:250,alt:[500,4.00]},
 cottagecheese:{n:'Cottage cheese',a:'D',u:'g',pk:500,p:5.00,pr:11,cup:225,alt:[250,3.00]},
 kimchi:{n:'Kimchi',a:'D',u:'g',pk:400,p:7.50,pr:1.5,ck:1},

 // Fruit & veg
 potato:{n:'Washed potatoes',a:'F',u:'g',pk:2000,p:5.00,pr:2,ea:[200,'potato'],alt:[1000,3.50]},
 swpotato:{n:'Sweet potato',a:'F',u:'g',pk:1000,p:4.90,pr:1.6,wt:1},
 onion:{n:'Brown onions',a:'F',u:'g',pk:1000,p:3.50,pr:1.1,ea:[150,'onion'],wt:1},
 red_onion:{n:'Red onion',a:'F',u:'ea',pk:1,p:0.80,pr:1.5,ea:[1,'red onion']},
 garlic:{n:'Garlic',a:'F',u:'ea',pk:1,p:1.20,pr:.3,pl:'bulb',cl:10},
 ginger:{n:'Fresh ginger',a:'F',u:'g',pk:100,p:2.50,pr:2,wt:1},
 carrot:{n:'Carrots',a:'F',u:'g',pk:1000,p:2.50,pr:.9,ea:[120,'carrot'],wt:1},
 broccoli:{n:'Broccoli',a:'F',u:'g',pk:500,p:3.45,pr:2.8,wt:1},
 capsicum:{n:'Red capsicum',a:'F',u:'ea',pk:1,p:1.80,pr:1.2,ea:[1,'capsicum']},
 zucchini:{n:'Zucchini',a:'F',u:'g',pk:1000,p:5.50,pr:1.2,ea:[200,'zucchini'],wt:1},
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
 mushroom:{n:'Cup mushrooms',a:'F',u:'g',pk:500,p:6.00,pr:3,wt:1},
 eggplant:{n:'Eggplant',a:'F',u:'ea',pk:1,p:3.50,pr:1,ea:[1,'eggplant']},
 greenbeans:{n:'Green beans',a:'F',u:'g',pk:500,p:4.50,pr:2,wt:1},

 lamb_mince:{n:'Lamb mince',a:'M',u:'g',pk:500,p:9.00,pr:18,t:'red'},
 pork_belly:{n:'Pork belly',a:'M',u:'g',pk:1000,p:17.00,pr:14,t:'pork',wt:1},
 whitefish:{n:'White fish fillets (basa)',a:'M',u:'g',pk:1000,p:14.00,pr:17,t:'seafood',wt:1},
 hummus:{n:'Hummus',a:'D',u:'g',pk:200,p:3.50,pr:7},
 beansprouts:{n:'Bean sprouts',a:'F',u:'g',pk:250,p:2.50,pr:3},
 massaman:{n:'Massaman curry paste',a:'P',u:'g',pk:195,p:3.80,pr:2,ck:1,pl:'jar',tbsp:16},
 ricenoodles:{n:'Flat rice noodles',a:'P',u:'g',pk:375,p:2.80,pr:6},
 cornchips:{n:'Plain corn chips',a:'P',u:'g',pk:230,p:3.50,pr:7,ck:1},
 turkish:{n:'Turkish rolls (4)',a:'B',u:'ea',pk:4,p:4.50,pr:9,pl:'4 pack',ea:[1,'roll'],whole:1},
 currypowder:{n:'Curry powder',a:'K',u:'g',pk:40,p:2.50,pr:0,ck:1,tsp:2.5,pan:1},
 worcestershire:{n:'Worcestershire sauce',a:'K',u:'ml',pk:250,p:3.00,pr:0,ck:1,pan:1},
 scotch:{n:'Scotch fillet steak',a:'M',u:'g',pk:1000,p:45.00,pr:21,t:'red',wt:1},
 lambcutlets:{n:'Lamb cutlets (frenched)',a:'M',u:'g',pk:1000,p:42.00,pr:16,t:'red',wt:1},
 barra:{n:'Barramundi fillets, skin on',a:'M',u:'g',pk:1000,p:32.00,pr:20,t:'seafood',wt:1},
 shortribs:{n:'Korean-cut beef short ribs',a:'M',u:'g',pk:1000,p:26.00,pr:15,t:'red',wt:1},
 wagyu:{n:'Wagyu beef mince',a:'M',u:'g',pk:500,p:11.00,pr:18,t:'red'},
 prosciutto:{n:'Prosciutto',a:'M',u:'g',pk:100,p:5.50,pr:25,t:'pork'},
 chk_mince:{n:'Chicken mince',a:'M',u:'g',pk:500,p:7.00,pr:20},
 pumpkin:{n:'Butternut pumpkin',a:'F',u:'g',pk:1000,p:3.50,pr:1,wt:1},
 iceberg:{n:'Iceberg lettuce',a:'F',u:'ea',pk:1,p:3.50,pr:1,ea:[1,'iceberg lettuce']},
 corncob:{n:'Corn cobs',a:'F',u:'ea',pk:1,p:1.20,pr:3,ea:[1,'corn cob']},
 rosemary:{n:'Rosemary',a:'F',u:'ea',pk:1,p:3.00,pr:0,pl:'bunch',ea:[1,'bunch']},
 sage:{n:'Sage',a:'F',u:'ea',pk:1,p:3.00,pr:0,pl:'bunch',ea:[1,'bunch']},
 harissa:{n:'Harissa paste',a:'P',u:'g',pk:190,p:4.50,pr:2,ck:1,pl:'jar',tbsp:16},
 capers:{n:'Capers',a:'P',u:'g',pk:100,p:3.00,pr:2,pl:'jar',tsp:5},
 quinoa:{n:'Quinoa',a:'K',u:'g',pk:500,p:5.00,pr:14,cup:170,pan:1},
 brownrice:{n:'Brown rice',a:'K',u:'g',pk:1000,p:3.50,pr:8,cup:190,pan:1},
 miso:{n:'White miso paste',a:'K',u:'g',pk:300,p:5.50,pr:12,ck:1,tbsp:17,pan:1},
 pork_cutlets:{n:'Pork cutlets',a:'M',u:'g',pk:1000,p:22.00,pr:18,t:'pork'},
 beef_cheek:{n:'Beef cheeks',a:'M',u:'g',pk:1000,p:24.00,pr:20,t:'red',wt:1},
 lamb_shanks:{n:'Lamb shanks',a:'M',u:'g',pk:1000,p:16.00,pr:13,t:'red',wt:1},
 duck:{n:'Duck breast fillets',a:'M',u:'g',pk:1000,p:38.00,pr:19,wt:1},
 rocket:{n:'Rocket',a:'F',u:'g',pk:120,p:3.50,pr:2.6},
 asparagus:{n:'Asparagus',a:'F',u:'ea',pk:1,p:3.00,pr:5,pl:'bunch',ea:[1,'bunch']},
 broccolini:{n:'Broccolini',a:'F',u:'ea',pk:1,p:3.00,pr:4,pl:'bunch',ea:[1,'bunch']},
 snowpeas:{n:'Snow peas',a:'F',u:'g',pk:1000,p:16.00,pr:2.8,wt:1},
 bokchoy:{n:'Baby bok choy',a:'F',u:'ea',pk:1,p:2.50,pr:1.5,pl:'bunch',ea:[1,'bunch']},
 ricepaper:{n:'Rice paper sheets',a:'P',u:'g',pk:200,p:3.00,pr:1},
 fivespice:{n:'Chinese five spice',a:'K',u:'g',pk:30,p:2.80,pr:0,tsp:2.2,pan:1},
 // Freezer
 peas:{n:'Frozen peas',a:'Z',u:'g',pk:1000,p:3.50,pr:5,cup:140,alt:[500,2.50]},
 edamame:{n:'Frozen shelled edamame',a:'Z',u:'g',pk:500,p:4.50,pr:11,cup:150},
 prawns:{n:'Raw peeled prawns',a:'Z',u:'g',pk:1000,p:32.00,pr:20,t:'seafood',alt:[500,17.00]},

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
 buns:{n:'Brioche burger buns (6)',a:'B',u:'ea',pk:6,p:4.50,pr:8,pl:'6 pack',ea:[1,'bun'],whole:1},
 wraps:{n:'Wraps (8)',a:'B',u:'ea',pk:8,p:3.50,pr:6,pl:'8 pack',ea:[1,'wrap'],whole:1},
 tortillas:{n:'Mini flour tortillas (12)',a:'B',u:'ea',pk:12,p:3.50,pr:4,pl:'12 pack',ea:[1,'tortilla'],whole:1},
 pita:{n:'Lebanese bread (6)',a:'B',u:'ea',pk:6,p:3.50,pr:9,pl:'6 pack',ea:[1,'pita'],whole:1},
 naan:{n:'Garlic naan (4)',a:'B',u:'ea',pk:4,p:4.50,pr:8,pl:'4 pack',ea:[1,'naan'],whole:1},

 // Gluten free swaps
 gf_pasta:{n:'GF pasta',a:'G',u:'g',pk:500,p:3.80,pr:7},
 gf_lasagne:{n:'GF lasagne sheets',a:'G',u:'g',pk:250,p:4.80,pr:6,noAldi:1},
 gf_crumbs:{n:'GF breadcrumbs',a:'G',u:'g',pk:200,p:4.50,pr:7,noAldi:1,cup:80},
 gf_buns:{n:'GF burger buns (4)',a:'G',u:'ea',pk:4,p:7.50,pr:5,pl:'4 pack',noAldi:1,ea:[1,'GF bun'],whole:1},
 gf_wraps:{n:'GF wraps (6)',a:'G',u:'ea',pk:6,p:7.00,pr:3,pl:'6 pack',ea:[1,'GF wrap'],whole:1},
 corn_tortillas:{n:'Corn tortillas',a:'G',u:'ea',pk:12,p:4.50,pr:2,pl:'12 pack',ck:1,noAldi:1,ea:[1,'corn tortilla'],whole:1},
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
 cinnamon:{n:'Ground cinnamon',a:'K',u:'g',pk:40,p:2.50,pr:0,tsp:2.6,pan:1},
 // Baking (sweet treats)
 castersugar:{n:'Caster sugar',a:'K',u:'g',pk:1000,p:2.20,pr:0,tbsp:13,cup:220,pan:1},
 cocoa:{n:'Cocoa powder',a:'K',u:'g',pk:375,p:5.50,pr:20,tbsp:7,pan:1},
 vanilla:{n:'Vanilla extract',a:'K',u:'ml',pk:50,p:5.00,pr:0,pan:1},
 bicarb:{n:'Bicarb soda',a:'K',u:'g',pk:500,p:2.00,pr:0,tsp:5,pan:1},
 bakingpowder:{n:'Baking powder',a:'K',u:'g',pk:125,p:2.30,pr:0,ck:1,tsp:4,pan:1},
 oats:{n:'Rolled oats',a:'K',u:'g',pk:750,p:2.00,pr:12,cup:90,pan:1},
 desiccated:{n:'Desiccated coconut',a:'K',u:'g',pk:250,p:2.50,pr:6,cup:80,pan:1},
 darkchoc:{n:'Dark cooking chocolate',a:'P',u:'g',pk:250,p:3.50,pr:5,ck:1,pl:'250g block'},
 chocchips:{n:'Dark choc bits',a:'P',u:'g',pk:250,p:3.50,pr:5,ck:1,cup:170},
 sweetbiscuits:{n:'Plain sweet biscuits (Marie)',a:'P',u:'g',pk:250,p:2.20,pr:7},
 creamcheese:{n:'Cream cheese (250g block)',a:'D',u:'g',pk:250,p:3.80,pr:6,pl:'250g block'},
 banana:{n:'Bananas',a:'F',u:'ea',pk:1,p:0.70,pr:1.1,ea:[1,'banana']},
 gf_biscuits:{n:'GF plain sweet biscuits',a:'G',u:'g',pk:150,p:3.50,pr:5}
};

// Regular ingredient -> what gluten free eaters get instead (scaled to the number of GF eaters)
const GFSWAP={panko:'gf_crumbs',flour:'gf_flour',pasta:'gf_pasta',lasagne:'gf_lasagne',buns:'gf_buns',wraps:'gf_wraps',pita:'gf_wraps',naan:'gf_wraps',tortillas:'corn_tortillas',soy:'tamari',gochujang:'sriracha',turkish:'gf_buns',sweetbiscuits:'gf_biscuits',oats:'desiccated'};

// ---------- Recipes (quantities per serve) ----------
// big: needs a whole roast, best for 4+ serves · c category · tier 'premium' or 'lighter' (blank = everyday) · t total minutes · h hands-on minutes (slow cooks) · d one-line description
// i ingredients · m method · l lunch note · g gluten free note
// Public menu: what the planner needs to price and list each dinner.
// The method, lunch note and gluten free note live in content/recipes/<id>.json and are only loaded for people allowed to see them.
const R=[
 {id:'bulgogi',n:'Korean Beef Bulgogi Bowls',c:'Bowls',t:40,d:'Sticky soy-garlic beef, quick-pickled cucumber, kimchi and gochujang mayo over rice.',
  i:[['beef_rump',240],['soy',25],['brownsugar',8],['sesameoil',5],['garlic',.12],['ginger',6],['springonion',.15],['rice',95],['cucumber',.3],['ricevinegar',10],['gochujang',8],['mayo',15],['kimchi',40],['sesameseeds',2]]},

 {id:'shawarma',n:'Chicken Shawarma Plates',c:'Bowls',t:45,d:'Spiced charred thighs, garlic yoghurt, pink pickled onions and a herby salad, with warm wraps.',
  i:[['chk_thigh',260],['cumin',1.2],['smokedpaprika',1],['turmeric',.5],['cinnamon',.3],['garlic',.12],['lemon',.3],['yoghurt',60],['red_onion',.2],['whitevinegar',10],['brownsugar',3],['cherrytom',60],['cucumber',.25],['parsley',.15],['wraps',1.5]]},

 {id:'ragu',n:'Slow-Cooked Beef Ragu',c:'Pasta',t:240,h:30,d:'Chuck braised for hours until it falls apart into a rich tomato sauce, over pasta with parmesan.',
  i:[['beef_chuck',250],['onion',60],['carrot',50],['garlic',.1],['tompaste',15],['tintom',200],['stockpowder',2],['oregano',.5],['pasta',120],['parm',15],['parsley',.05]]},

 {id:'butter',n:'Proper Butter Chicken',c:'Curry',t:50,d:'Yoghurt-marinated thighs in a spiced tomato and cream sauce, with rice, naan and coriander.',
  i:[['chk_thigh',260],['yoghurt',40],['garammasala',3],['cumin',1],['turmeric',.5],['chillipowder',.5],['garlic',.12],['ginger',8],['onion',50],['butter',15],['tompaste',15],['tintom',120],['cream',50],['brownsugar',3],['rice',95],['naan',.5],['coriander',.1]]},

 {id:'carnitas',n:'Pork Carnitas Tacos',c:'Fakeaway',t:300,h:30,d:'Slow-cooked spiced pork, crisped up in the pan, with slaw, lime crema, jalapeños and avo.',
  i:[['pork_shoulder',260],['cumin',1.2],['oregano',.6],['smokedpaprika',1],['onion',40],['garlic',.1],['lime',.4],['stockpowder',2],['tortillas',2.5],['cabbage',.1],['sourcream',30],['jalapenos',10],['coriander',.12],['avocado',.25]]},

 {id:'greencurry',n:'Thai Green Chicken Curry',c:'Curry',t:40,d:'Green curry with chicken, eggplant, beans and Thai basil over jasmine rice.',
  i:[['chk_thigh',250],['greencurry',30],['coconut',150],['fishsauce',8],['brownsugar',4],['eggplant',.15],['greenbeans',60],['thaibasil',.15],['lime',.2],['chilli',.2],['rice',95]]},

 {id:'souvlaki',n:'Pork Souvlaki & Chips',c:'Fakeaway',t:50,d:'Lemon-oregano pork, tzatziki, Greek salad, chips and warm pita.',
  i:[['pork_shoulder',250],['oregano',1],['lemon',.35],['garlic',.12],['yoghurt',50],['cucumber',.3],['mint',.05],['cherrytom',60],['red_onion',.15],['fetta',25],['pita',1.2],['potato',220]]},

 {id:'smash',n:'Smash Burgers & Chips',c:'Fakeaway',t:45,d:'Crispy-edged smashed patties with cheese, pickles and special sauce, plus proper chips.',
  i:[['beef_mince',220],['slices',2],['buns',1],['pickles',15],['onion',30],['mayo',15],['ketchup',8],['mustard',4],['cos',.1],['potato',250]]},

 {id:'parma',n:'Chicken Parmas, Chips & Salad',c:'Pub classics',t:60,d:'Crumbed chicken with napoli, ham and melted cheese. The pub classic, at home.',
  i:[['chk_breast',250],['flour',10],['eggs',.4],['panko',30],['passata',70],['oregano',.3],['ham',30],['mozz',40],['potato',250],['cos',.15],['cucumber',.2],['lemon',.1]]},

 {id:'bun',n:'Vietnamese Pork Noodle Salad',c:'Bowls',tier:'lighter',t:35,d:'Lemongrass pork over vermicelli with herbs, crunchy veg, peanuts and nuoc cham.',
  i:[['pork_mince',240],['lemongrass',8],['fishsauce',14],['brownsugar',10],['garlic',.12],['vermicelli',80],['cos',.15],['cucumber',.25],['carrot',50],['mint',.1],['coriander',.1],['peanuts',15],['lime',.35],['chilli',.3]]},

 {id:'chorizo',n:'Spicy Chorizo & Chicken Pasta',c:'Pasta',t:45,d:'Crispy chorizo and chicken in a smoky, creamy tomato sauce with spinach and parmesan.',
  i:[['chorizo',100],['chk_thigh',130],['onion',40],['capsicum',.2],['garlic',.1],['smokedpaprika',1],['chilliflakes',.3],['tompaste',15],['tintom',120],['cream',30],['spinach',20],['pasta',120],['parm',15],['parsley',.05]]},

 {id:'salmonbowl',n:'Japanese Salmon Rice Bowls',c:'Bowls',t:30,d:'Glazed salmon, seasoned rice, edamame, cucumber, avo and sriracha mayo.',
  i:[['salmon',200],['soy',20],['mirin',10],['honey',8],['ginger',4],['rice',95],['ricevinegar',8],['cucumber',.3],['avocado',.3],['edamame',60],['mayo',15],['sriracha',5],['springonion',.1],['sesameseeds',2]]},

 {id:'friedrice',n:'Chicken Fried Rice',c:'Bowls',t:30,d:'Better than takeaway: smoky wok-fried rice with chicken, egg and veg.',
  i:[['chk_thigh',200],['eggs',1],['rice',110],['peas',50],['carrot',40],['springonion',.2],['garlic',.1],['ginger',4],['soy',20],['oyster',8],['sesameoil',4]]},

 {id:'roastpork',big:1,n:'Roast Pork with Crackling',c:'Roasts',t:180,h:30,d:'Crunchy crackling, roast veg, gravy and a sharp apple slaw.',
  i:[['pork_roast',300],['potato',200],['swpotato',120],['carrot',60],['cabbage',.1],['apple',.3],['mayo',10],['stockpowder',3],['cornflour',3]]},

 {id:'kraprao',n:'Thai Basil Pork with Fried Egg',c:'Bowls',t:25,d:'Pad kra pao: garlicky, chilli-hot pork mince with Thai basil and a crispy fried egg.',
  i:[['pork_mince',230],['garlic',.12],['chilli',.5],['oyster',10],['soy',10],['fishsauce',6],['brownsugar',4],['greenbeans',60],['thaibasil',.2],['eggs',1],['rice',95]]},

 {id:'bake',n:'Beef & Tomato Pasta Bake',c:'Pasta',t:50,d:'Rich beef and veg sauce baked through pasta under a thick layer of melted cheese.',
  i:[['beef_mince',220],['onion',40],['garlic',.08],['capsicum',.2],['zucchini',60],['tompaste',15],['tintom',150],['oregano',.5],['pasta',110],['cheese',40],['mozz',20]]},

 {id:'tuscan',n:'Creamy Tuscan Chicken Pasta',c:'Pasta',t:35,d:'Golden chicken in a garlicky cream sauce with sun-dried tomatoes, spinach and parmesan.',
  i:[['chk_thigh',220],['garlic',.1],['sundried',30],['cream',60],['parm',15],['spinach',25],['stockpowder',2],['oregano',.3],['pasta',120]]},

 {id:'chook',big:1,n:'Roast Chook, Crispy Potatoes & Gravy',c:'Roasts',t:100,d:'Lemon and garlic roast chicken, crunchy potatoes, greens and proper gravy.',
  i:[['chk_whole',450],['lemon',.15],['garlic',.1],['butter',10],['potato',300],['carrot',80],['greenbeans',80],['stockpowder',3],['cornflour',3]]},

 {id:'lamb',big:1,n:'Slow-Roast Lamb, Smashed Potatoes',c:'Roasts',t:210,h:25,d:'Garlic and oregano lamb shoulder roasted until it pulls apart, with crispy smashed potatoes.',
  i:[['lamb_sh',320],['garlic',.12],['oregano',1],['lemon',.2],['potato',250],['yoghurt',40],['mint',.08],['cos',.12],['cucumber',.2]]},

 {id:'lasagne',n:'Beef & Bacon Lasagne',c:'Pasta',t:90,d:'Slow-simmered beef and bacon ragu layered with a proper cheesy white sauce.',
  i:[['beef_mince',200],['bacon',30],['onion',50],['carrot',40],['garlic',.08],['tompaste',15],['tintom',150],['oregano',.5],['lasagne',70],['butter',12],['flour',12],['milk',150],['cheese',40],['parm',10]]},

 {id:'burrito',n:'Chicken Burrito Bowls',c:'Bowls',t:35,d:'Smoky chicken, lime-coriander rice, black beans, corn salsa, cheese and crema.',
  i:[['chk_thigh',240],['smokedpaprika',1],['cumin',1],['oregano',.4],['garlic',.08],['lime',.4],['rice',90],['coriander',.12],['blackbeans',100],['corn',60],['cherrytom',50],['red_onion',.1],['jalapenos',8],['cheese',25],['sourcream',30],['avocado',.3]]},

 {id:'risotto',n:'Garlic Prawn & Chorizo Risotto',c:'Pasta',t:45,d:'Creamy risotto with crispy chorizo, garlic prawns, peas and roasted tomatoes.',
  i:[['prawns',150],['chorizo',50],['onion',40],['garlic',.1],['arborio',100],['stockpowder',4],['cherrytom',50],['peas',50],['parm',15],['butter',10],['lemon',.1],['parsley',.05]]},

 {id:'chickpea',n:'Chickpea, Spinach & Coconut Curry',c:'Curry',t:35,d:'A big, cheap, warming veg curry with yoghurt and naan.',
  i:[['chickpeas',300],['currypaste',30],['onion',50],['garlic',.08],['ginger',5],['coconut',100],['tintom',100],['spinach',40],['rice',90],['yoghurt',40],['naan',.5],['coriander',.1]]},
 {id:'honeygarlic',n:'Honey Garlic Chicken & Greens',c:'Bowls',t:30,d:'Crispy-edged chicken in a sticky honey, garlic and soy glaze with charred broccoli and rice.',
  i:[['chk_thigh',250],['honey',15],['soy',20],['garlic',.15],['ginger',5],['ricevinegar',5],['cornflour',4],['broccoli',120],['rice',95],['springonion',.1],['sesameseeds',2]]},

 {id:'massaman',n:'Slow-Cooked Beef Massaman',c:'Curry',t:180,h:25,d:'Chuck braised in a rich, peanutty massaman with potatoes until it falls apart.',
  i:[['beef_chuck',250],['massaman',35],['coconut',160],['potato',150],['onion',50],['fishsauce',8],['brownsugar',6],['peanuts',15],['lime',.15],['rice',95],['coriander',.1]]},

 {id:'katsu',n:'Chicken Katsu Curry',c:'Fakeaway',t:50,d:'Crunchy panko chicken with a from-scratch Japanese curry sauce, rice and a sharp cabbage salad.',
  i:[['chk_thigh',240],['flour',18],['eggs',.4],['panko',35],['onion',50],['carrot',60],['garlic',.08],['ginger',4],['currypowder',4],['stockpowder',3],['honey',6],['soy',8],['rice',95],['cabbage',.1],['ricevinegar',6]]},

 {id:'greektray',n:'Greek Lemon Chicken Tray Bake',c:'Roasts',t:60,d:'One-tray lemon, garlic and oregano chicken with crispy potatoes, tomatoes, fetta and tzatziki.',
  i:[['chk_thigh',250],['potato',250],['lemon',.4],['garlic',.15],['oregano',1.2],['red_onion',.25],['cherrytom',70],['fetta',25],['yoghurt',40],['cucumber',.2],['parsley',.05]]},

 {id:'mongolian',n:'Mongolian Beef',c:'Fakeaway',t:30,d:'Thin, crispy beef tossed in a sweet, garlicky soy sauce with broccoli and spring onions.',
  i:[['beef_rump',230],['cornflour',8],['soy',25],['brownsugar',12],['garlic',.15],['ginger',6],['springonion',.25],['broccoli',100],['rice',95],['sesameoil',3]]},

 {id:'tandoori',n:'Tandoori Chicken, Raita & Rice',c:'Curry',t:45,d:'Charred yoghurt-marinated chicken with cooling mint raita, pickled onions, rice and naan.',
  i:[['chk_thigh',260],['yoghurt',90],['currypaste',20],['garammasala',1.5],['lemon',.3],['garlic',.1],['cucumber',.25],['mint',.1],['red_onion',.2],['whitevinegar',8],['rice',95],['naan',.5]]},

 {id:'nachos',n:'Loaded Beef Nachos',c:'Fakeaway',t:35,d:'Spiced beef and beans under melted cheese, with guacamole, salsa, sour cream and jalapeños.',
  i:[['beef_mince',200],['onion',40],['garlic',.08],['cumin',1.2],['smokedpaprika',1],['chillipowder',.5],['oregano',.4],['tompaste',12],['tintom',100],['blackbeans',80],['cornchips',70],['cheese',50],['avocado',.4],['lime',.25],['cherrytom',50],['red_onion',.1],['coriander',.1],['sourcream',30],['jalapenos',10]]},

 {id:'padthai',n:'Chicken Pad Thai',c:'Bowls',t:35,d:'Flat rice noodles wok-tossed with chicken, egg, bean sprouts and peanuts in a sweet-sour sauce.',
  i:[['chk_thigh',200],['ricenoodles',90],['eggs',1],['beansprouts',50],['springonion',.2],['garlic',.1],['fishsauce',15],['brownsugar',12],['ketchup',10],['lime',.35],['peanuts',20],['chilliflakes',.3]]},

 {id:'cottage',n:'Cottage Pie',c:'Comfort',t:75,d:'Rich beef and veg in gravy under a thick, golden layer of cheesy mash.',
  i:[['beef_mince',220],['onion',50],['carrot',60],['garlic',.08],['tompaste',15],['worcestershire',8],['stockpowder',3],['peas',40],['cornflour',3],['potato',300],['butter',15],['milk',40],['cheese',30]]},

 {id:'chilli',n:'Chilli Con Carne',c:'Comfort',t:60,d:'Smoky beef and bean chilli with rice, sour cream, cheese and fresh coriander.',
  i:[['beef_mince',220],['onion',50],['capsicum',.3],['garlic',.1],['cumin',1.5],['smokedpaprika',1.5],['chillipowder',.8],['oregano',.4],['cinnamon',.2],['tompaste',15],['tintom',150],['blackbeans',100],['rice',90],['sourcream',30],['cheese',25],['coriander',.1],['lime',.15]]},

 {id:'periperi',n:'Peri Peri Chicken, Chips & Slaw',c:'Fakeaway',t:55,d:'Fiery, lemony charred chicken with crunchy chips and a creamy slaw.',
  i:[['chk_thigh',260],['chilli',.6],['garlic',.12],['smokedpaprika',1.5],['oregano',.5],['lemon',.35],['whitevinegar',8],['brownsugar',3],['potato',250],['cabbage',.12],['carrot',50],['mayo',20]]},

 {id:'kofta',n:'Lamb Kofta, Hummus & Flatbread',c:'Bowls',t:40,d:'Spiced lamb kofta with hummus, Israeli salad, yoghurt and warm flatbreads.',
  i:[['lamb_mince',220],['onion',30],['garlic',.08],['cumin',1.2],['cinnamon',.3],['parsley',.15],['hummus',50],['pita',1.2],['cucumber',.3],['cherrytom',70],['red_onion',.12],['lemon',.25],['yoghurt',40]]},

 {id:'porkbelly',n:'Sticky Pork Belly Bowls',c:'Bowls',t:60,d:'Crispy pork belly bites in a sticky soy-honey glaze with rice, greens and pickled cucumber.',
  i:[['pork_belly',220],['soy',20],['honey',15],['garlic',.1],['ginger',5],['broccoli',100],['cucumber',.25],['ricevinegar',8],['rice',95],['springonion',.1],['sesameseeds',2]]},

 {id:'steaksanga',n:'Steak Sangas & Chips',c:'Pub classics',t:45,d:'Seared rump on toasted Turkish with sticky caramelised onions, cheese and chips.',
  i:[['beef_rump',200],['onion',80],['brownsugar',5],['whitevinegar',5],['turkish',1],['slices',1],['cos',.1],['cherrytom',40],['mayo',15],['potato',230]]},

 {id:'meatballs',n:'Spaghetti & Meatballs',c:'Pasta',t:60,d:'Big, juicy beef and pork meatballs simmered in tomato sauce, over pasta with parmesan.',
  i:[['beef_mince',130],['pork_mince',100],['panko',20],['eggs',.25],['parm',20],['garlic',.12],['onion',40],['passata',180],['tintom',100],['oregano',.5],['pasta',120],['parsley',.05]]},

 {id:'fishtacos',n:'Crispy Fish Tacos',c:'Fakeaway',t:35,d:'Spiced crispy fish in warm tortillas with lime slaw, sriracha mayo and avocado.',
  i:[['whitefish',220],['flour',15],['smokedpaprika',1],['cumin',.6],['tortillas',2.5],['cabbage',.1],['lime',.4],['mayo',20],['sriracha',6],['avocado',.3],['coriander',.12],['sourcream',20]]},
 {id:'scotch',n:'Scotch Fillet, Chimichurri & Crispy Potatoes',c:'Steak night',tier:'premium',t:60,d:'Thick-cut scotch fillet, rested and sliced, with sharp chimichurri, rosemary potatoes and charred greens.',
  i:[['scotch',230],['parsley',.2],['garlic',.12],['chilliflakes',.3],['oregano',.4],['whitevinegar',10],['potato',250],['rosemary',.1],['butter',15],['greenbeans',90],['lemon',.15]]},

 {id:'misosalmon',n:'Miso-Glazed Salmon, Sesame Greens',c:'Seafood',tier:'premium',t:35,d:'Sweet-salty miso salmon caramelised under the grill, with sesame greens and seasoned rice.',
  i:[['salmon',200],['miso',20],['mirin',10],['honey',6],['soy',8],['rice',90],['ricevinegar',8],['broccoli',90],['greenbeans',50],['sesameoil',4],['sesameseeds',2],['springonion',.1],['lime',.15]]},

 {id:'lambcutlets',n:'Lamb Cutlets, Salsa Verde & Smashed Potatoes',c:'Steak night',tier:'premium',t:45,d:'Pink, charred lamb cutlets with a punchy herb salsa verde, crispy smashed potatoes and a crisp salad.',
  i:[['lambcutlets',240],['garlic',.1],['rosemary',.08],['lemon',.3],['parsley',.15],['mint',.1],['capers',6],['potato',230],['cos',.12],['cucumber',.2]]},

 {id:'prawnlinguine',n:'Chilli Prawn Linguine',c:'Seafood',tier:'premium',t:25,d:'Garlicky chilli prawns tossed through pasta with lemon, parsley and a little butter. Restaurant-quick.',
  i:[['prawns',170],['pasta',120],['garlic',.15],['chilli',.4],['cherrytom',60],['butter',12],['lemon',.3],['parsley',.12],['chilliflakes',.2]]},

 {id:'saltimbocca',n:'Chicken Saltimbocca, Crispy Potatoes',c:'Italian',tier:'premium',t:45,d:'Chicken wrapped in prosciutto and sage, pan-fried golden with a butter-lemon sauce.',
  i:[['chk_breast',230],['prosciutto',25],['sage',.15],['flour',8],['butter',15],['lemon',.25],['stockpowder',2],['potato',230],['rosemary',.05],['spinach',40]]},

 {id:'barra',n:'Crispy-Skin Barramundi, Charred Corn Salad',c:'Seafood',tier:'premium',t:35,d:'Shatteringly crisp-skinned barra with lime herb butter and a smoky charred corn and avocado salad.',
  i:[['barra',200],['butter',15],['lime',.4],['coriander',.12],['corncob',.6],['avocado',.3],['cherrytom',60],['red_onion',.1],['smokedpaprika',.5],['rice',80]]},

 {id:'galbi',n:'Korean BBQ Short Ribs (Galbi)',c:'Fakeaway',tier:'premium',t:40,d:'Thin-cut short ribs in a pear-sweet soy marinade, charred hot, with rice, kimchi and lettuce wraps.',
  i:[['shortribs',300],['soy',25],['brownsugar',10],['apple',.25],['garlic',.15],['ginger',6],['sesameoil',6],['springonion',.15],['rice',90],['kimchi',40],['cos',.15],['sesameseeds',2],['gochujang',6]]},

 {id:'wagyuburger',n:'Wagyu Double Cheeseburgers',c:'Fakeaway',tier:'premium',t:45,d:'Rich wagyu smash patties, melted cheese, caramelised onion and burger sauce on brioche, with rosemary fries.',
  i:[['wagyu',200],['slices',2],['buns',1],['onion',60],['brownsugar',3],['pickles',15],['mayo',15],['ketchup',8],['mustard',4],['cos',.08],['potato',250],['rosemary',.05]]},
 {id:'poke',n:'Teriyaki Chicken Poke Bowls',c:'Bowls',tier:'lighter',t:30,d:'Lean teriyaki chicken over brown rice with edamame, crunchy veg, avocado and pickled ginger-style dressing.',
  i:[['chk_breast',210],['soy',18],['mirin',10],['honey',5],['ginger',6],['brownrice',75],['edamame',60],['cucumber',.3],['carrot',50],['avocado',.25],['ricevinegar',10],['springonion',.1],['sesameseeds',2],['lime',.15]]},

 {id:'larb',n:'Thai Chicken Larb Lettuce Cups',c:'Bowls',tier:'lighter',t:25,d:'Zingy minced chicken with lime, chilli and loads of fresh herbs, scooped into crisp lettuce cups.',
  i:[['chk_mince',230],['lemongrass',5],['garlic',.08],['fishsauce',12],['lime',.5],['brownsugar',3],['chilli',.3],['red_onion',.2],['mint',.15],['coriander',.15],['iceberg',.25],['cucumber',.2],['brownrice',60]]},

 {id:'harissaquinoa',n:'Harissa Chicken, Roast Pumpkin & Quinoa',c:'Bowls',tier:'lighter',t:45,d:'Smoky harissa chicken over roast pumpkin, spinach and quinoa, with fetta and minty yoghurt.',
  i:[['chk_breast',220],['harissa',15],['lemon',.3],['pumpkin',150],['cumin',.6],['quinoa',55],['spinach',40],['red_onion',.1],['fetta',20],['yoghurt',40],['mint',.08]]},

 {id:'salmontray',n:'Lemon Herb Salmon Tray Bake',c:'Seafood',tier:'lighter',t:35,d:'Salmon roasted on a tray of zucchini, beans, tomatoes and baby potatoes with lemon, garlic and herbs.',
  i:[['salmon',180],['potato',120],['zucchini',100],['greenbeans',60],['cherrytom',70],['lemon',.35],['garlic',.08],['oregano',.4],['parsley',.08]]},

 {id:'vietsalad',n:'Vietnamese Chicken & Cabbage Salad',c:'Bowls',tier:'lighter',t:30,d:'Poached chicken with crunchy cabbage, carrot and herbs, tossed in a sweet-sour lime dressing with peanuts.',
  i:[['chk_breast',210],['cabbage',.15],['carrot',60],['cucumber',.25],['mint',.12],['coriander',.12],['peanuts',15],['fishsauce',12],['lime',.4],['brownsugar',6],['chilli',.3],['garlic',.05],['brownrice',60]]},

 {id:'prawnstirfry',n:'Ginger Prawn & Greens Stir-Fry',c:'Seafood',tier:'lighter',t:25,d:'Quick-fire prawns with broccoli, beans and capsicum in a light ginger-garlic sauce over brown rice.',
  i:[['prawns',170],['broccoli',100],['greenbeans',60],['capsicum',.3],['garlic',.1],['ginger',8],['soy',15],['oyster',6],['cornflour',3],['brownrice',75],['springonion',.15]]},
 {id:'cotoletta',n:'Pork Cotoletta, Rocket & Parmesan',c:'Italian',tier:'premium',t:40,d:'Golden crumbed pork cutlets, Milanese style, with a peppery rocket, parmesan and lemon salad.',
  i:[['pork_cutlets',260],['flour',10],['eggs',.4],['panko',35],['parm',20],['butter',12],['lemon',.4],['rocket',40],['cherrytom',60],['potato',180],['rosemary',.05]]},

 {id:'beefcheek',n:'Braised Beef Cheek Pappardelle',c:'Pasta',tier:'premium',t:240,h:30,d:'Beef cheeks braised for hours until they melt into a deep, glossy sauce, tossed through wide pasta.',
  i:[['beef_cheek',230],['onion',60],['carrot',50],['garlic',.1],['tompaste',20],['tintom',150],['stockpowder',3],['rosemary',.08],['pasta',120],['parm',20],['butter',8],['parsley',.05]]},

 {id:'lambshanks',n:'Rosemary Lamb Shanks & Creamy Mash',c:'Roasts',tier:'premium',t:210,h:25,d:'Fall-off-the-bone shanks in a rich tomato and rosemary gravy, over buttery mash with greens.',
  i:[['lamb_shanks',380],['onion',50],['carrot',60],['garlic',.1],['tompaste',15],['tintom',120],['stockpowder',3],['rosemary',.1],['potato',280],['butter',20],['milk',50],['greenbeans',80],['cornflour',3]]},

 {id:'duck',n:'Five-Spice Duck Breast, Bok Choy & Rice',c:'Asian',tier:'premium',t:35,d:'Crispy-skinned duck breast, pink in the middle, with a sticky orange-soy glaze and garlic bok choy.',
  i:[['duck',200],['fivespice',1.5],['soy',20],['honey',12],['ginger',5],['garlic',.1],['bokchoy',.5],['rice',90],['springonion',.1],['sesameseeds',2]]},

 {id:'thaibeef',n:'Thai Beef Salad',c:'Bowls',tier:'lighter',t:30,d:'Seared rump sliced over crunchy veg and herbs with a hot-sour lime and chilli dressing.',
  i:[['beef_rump',200],['fishsauce',12],['lime',.5],['brownsugar',5],['chilli',.4],['garlic',.05],['cucumber',.35],['cherrytom',70],['red_onion',.15],['mint',.12],['coriander',.12],['cos',.15],['peanuts',10],['brownrice',55]]},

 {id:'moroccan',n:'Moroccan Chicken & Chickpea Stew',c:'Curry',tier:'lighter',t:45,d:'Warmly spiced chicken, chickpeas and tomato with lemon and herbs, over fluffy quinoa.',
  i:[['chk_breast',200],['onion',50],['garlic',.08],['ginger',4],['cumin',1.2],['cinnamon',.4],['smokedpaprika',.6],['turmeric',.3],['tintom',150],['chickpeas',100],['zucchini',80],['stockpowder',2],['lemon',.2],['quinoa',50],['parsley',.1],['yoghurt',30]]},

 {id:'lemonfish',n:'Lemon Pepper Fish, Greens & Quinoa',c:'Seafood',tier:'lighter',t:25,d:'Pan-fried lemon pepper fish over herby quinoa with garlicky greens. Light, quick and clean.',
  i:[['whitefish',200],['lemon',.4],['garlic',.08],['quinoa',55],['broccoli',100],['greenbeans',60],['spinach',30],['parsley',.1],['cherrytom',50]]},

 {id:'souvsalad',n:'Chicken Souvlaki Salad Bowls',c:'Bowls',tier:'lighter',t:35,d:'Lemon-oregano chicken over a big Greek salad and quinoa, with a light tzatziki.',
  i:[['chk_breast',210],['oregano',1],['lemon',.35],['garlic',.08],['yoghurt',50],['cucumber',.35],['cherrytom',80],['red_onion',.12],['fetta',15],['cos',.15],['quinoa',45],['mint',.05]]},

 {id:'ricepaper',n:'Prawn Rice Paper Rolls',c:'Seafood',tier:'lighter',t:40,d:'Fresh rolls packed with prawns, vermicelli, crunchy veg and herbs, with a zingy dipping sauce.',
  i:[['prawns',185],['ricepaper',35],['vermicelli',40],['cos',.15],['carrot',50],['cucumber',.3],['mint',.12],['coriander',.12],['fishsauce',10],['lime',.35],['brownsugar',5],['chilli',.3],['peanuts',10]]},
 // ---------- October 2026 drop: quick spring dinners ----------
 {id:'lemonchook',n:'Lemon Garlic Chicken, Asparagus & Crushed Potatoes',c:'Comfort',t:30,added:'2026-10-14',d:'Golden chicken thighs in a lemon-garlic butter, with spring asparagus and crushed potatoes and peas.',
  i:[['chk_thigh',240],['potato',250],['asparagus',.5],['peas',60],['lemon',.4],['garlic',.15],['butter',12],['parsley',.15]]},

 {id:'gingerpork',n:'Ginger Pork, Snow Peas & Broccolini Rice Bowls',c:'Bowls',t:25,added:'2026-10-14',d:'Crispy ginger pork mince with crunchy spring greens in a sticky soy-honey glaze. Faster than delivery.',
  i:[['pork_mince',220],['rice',95],['snowpeas',70],['broccolini',.4],['ginger',8],['garlic',.12],['soy',20],['oyster',15],['honey',8],['sesameoil',4],['springonion',.2],['chilli',.25],['peanuts',12]]},

 {id:'scotchverde',n:'Scotch Fillet, Charred Asparagus & Salsa Verde',c:'Steak night',tier:'premium',t:30,added:'2026-10-14',d:'Rested scotch fillet with a sharp herb and caper salsa verde, crispy potatoes and the first of the spring asparagus.',
  i:[['scotch',200],['potato',250],['asparagus',.5],['parsley',.3],['mint',.15],['capers',6],['lemon',.3],['garlic',.1],['butter',10]]},

 {id:'prawnquinoa',n:'Garlic Prawns, Broccolini & Lemon Quinoa',c:'Seafood',tier:'lighter',t:25,added:'2026-10-14',d:'Seared garlic-chilli prawns and charred spring greens over zesty lemon quinoa with a little fetta.',
  i:[['prawns',180],['quinoa',60],['broccolini',.5],['snowpeas',60],['lemon',.4],['garlic',.15],['chilli',.3],['parsley',.12],['fetta',25]]},

 {id:'springcaesar',n:'Chicken Caesar with Charred Asparagus',c:'Salads',t:30,added:'2026-10-14',d:'A proper Caesar: crisp cos, jammy eggs, bacon, garlicky croutons and a real dressing, with spring asparagus.',
  i:[['chk_breast',200],['cos',.5],['asparagus',.4],['bacon',40],['eggs',1],['parm',20],['turkish',.5],['mayo',25],['lemon',.25],['garlic',.1],['worcestershire',3]]},

 {id:'proteinburrito',n:'Protein Beef Burrito Bowls',c:'Bowls',t:30,added:'2026-10-17',d:'Lean smoky beef and black beans with roast sweet potato, whipped cottage cheese, avo and a drizzle of hot honey. Around 70g protein a bowl.',
  i:[['beef_lean',230],['swpotato',150],['onion',40],['garlic',.08],['tompaste',15],['smokedpaprika',1.2],['cumin',1.2],['chillipowder',.5],['oregano',.4],['blackbeans',80],['rice',60],['lime',.4],['coriander',.15],['cos',.2],['corn',50],['avocado',.4],['cottagecheese',100],['honey',12],['chilliflakes',.5]]}
];

// ---------- Sweet treats (optional extras, never counted as dinners) ----------
// Quantities are for ONE BATCH, not per serve. mk = how many it makes, mu = what they're called.
// If anyone in the house eats gluten free, the whole batch uses the GF swaps so everyone can share.
// Method, gluten free note (g) and keeping note (k) live in content/recipes/<id>.json, same as dinners.
const T=[
 {id:'brownie',n:'Fudgy Chocolate Brownies',c:'Tray bake',t:50,mk:16,mu:'squares',d:'Crackly top, gooey middle. One tray sorts the whole house for the week.',
  i:[['butter',185],['darkchoc',200],['castersugar',275],['eggs',3],['flour',85],['cocoa',40],['vanilla',5]]},
 {id:'crumble',n:'Apple Crumble',c:'Pudding',t:55,mk:8,mu:'serves',d:'Soft cinnamon apples under a crunchy oat topping. Best with a pour of cold cream.',
  i:[['apple',6],['brownsugar',150],['lemon',.5],['cinnamon',3],['flour',150],['oats',100],['butter',125],['cream',300]]},
 {id:'cheesecake',n:'Baked Vanilla Cheesecake',c:'Cake',t:90,mk:12,mu:'slices',d:'Creamy and tangy on a buttery biscuit base. Make it the night before so it sets.',
  i:[['sweetbiscuits',250],['butter',125],['creamcheese',500],['castersugar',150],['eggs',3],['sourcream',300],['lemon',1],['vanilla',5],['flour',15]]},
 {id:'cookies',n:'Choc Chip Cookies',c:'Biscuits',t:30,mk:24,mu:'cookies',d:'Chewy in the middle, crisp round the edges. Lunchboxes sorted for the week.',
  i:[['butter',250],['brownsugar',200],['castersugar',100],['eggs',2],['vanilla',10],['flour',375],['bicarb',5],['chocchips',250]]},
 {id:'bananabread',n:'Banana Bread',c:'Loaf',t:70,mk:10,mu:'slices',d:'The best thing to do with brown bananas. Toast a slice with butter for brekkie.',
  i:[['banana',3],['butter',125],['brownsugar',150],['eggs',2],['vanilla',5],['flour',225],['bicarb',5],['bakingpowder',4],['cinnamon',3]]}
];

// ---------- Meal kit and ready meal prices for the Kit Tax ----------
// t = price per serve by box size (people) then meals per week, ongoing prices (not first-box offers).
// del = delivery per box. Where sources differ we use the lower fee, so we never overstate what a kit costs.
const KITS=[
 {n:'HelloFresh',del:9.99,t:{2:{2:14.99,3:12.99,4:12.29,5:11.69,6:11.29},3:{2:14.19,3:11.99,4:11.49,5:10.59,6:9.99},4:{2:13.59,3:11.29,4:10.39,5:9.59,6:8.99},5:{2:12.99,3:10.99,4:10.29,5:9.49,6:8.89},6:{2:12.49,3:10.49,4:9.69,5:8.89,6:8.59}},
  src:'hellofresh.com.au/meal-kits/meal-plans (checked 14 Oct 2026); delivery $9.99 per deliveryrank.com Apr 2026 (Tom\'s Guide reports $11.99)'},
 {n:'Marley Spoon',del:11.99,t:{2:{2:13.99,3:12.99,4:11.99,5:11.49,6:10.99},4:{2:11.99,3:10.99,4:9.99,5:8.99,6:7.99}},
  src:'deliveryrank.com Marley Spoon AU review (Dec 2025); delivery $11.99 per Marley Spoon help centre'},
 {n:'Dinnerly',del:11.99,t:{2:{2:9.85,3:8.49,4:7.99,5:7.49,6:7.28},4:{2:7.79,3:6.99,4:6.69,5:6.49,6:5.49}},
  src:'deliveryrank.com Dinnerly AU review (Nov 2025); delivery $11.99 per Dinnerly help centre'},
 {n:'EveryPlate',del:9.99,t:{2:{3:10.33,4:9.37,5:8.50,6:7.92},4:{3:7.50,4:6.87,5:6.50,6:6.04},6:{3:6.67,4:6.04,5:5.67,6:5.00}},
  src:'deliveryrank.com EveryPlate AU review (Apr 2026), metro delivery'},
 {n:'My Muscle Chef',ready:1,ps:10.95,del:0,src:'standard main meal price, weightloss.com.au (checked Aug 2026); delivery not counted'},
 {n:'Youfoodz',ready:1,ps:10.99,del:0,src:'standard meal price, foodboxmate.com (Jan 2026); delivery not counted'}
];
const KITS_DEFAULT=KITS;
// What a kit charges for this many serves a meal (people, plus lunches) and dinners a week.
// Kits only sell set box sizes, so you buy the smallest box (or boxes) that covers everyone, each with its own delivery.
// Fewer dinners than a plan's minimum are priced pro rata at the minimum plan's rate; more than 6 at the 6-meal rate.
function kitCost(k,perMeal,dinners){
  if(!dinners||!perMeal)return 0;
  if(k.ready)return dinners*perMeal*k.ps+k.del;
  const rate=(b,d)=>{const row=k.t[b];const ms=Object.keys(row).map(Number).sort((a,c)=>a-c);return row[ms.find(m=>m>=d)??ms[ms.length-1]]};
  const sizes=Object.keys(k.t).map(Number);let best=Infinity;
  const go=(boxes,serves,cost)=>{if(serves>=perMeal){best=Math.min(best,cost);return}if(boxes>=4)return;for(const b of sizes)go(boxes+1,serves+b,cost+dinners*b*rate(b,dinners)+k.del)};
  go(0,0,0);return best;
}
const kitLabel=k=>k.ready?k.n+' (ready meals)':k.n;
