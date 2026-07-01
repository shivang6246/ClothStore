package com.example.demo;

import com.example.demo.entity.Product;
import com.example.demo.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProductDataSeeder implements ApplicationRunner {

    private final ProductRepository productRepository;

    private static final List<String> SHIRT_SIZES = Arrays.asList("XS", "S", "M", "L", "XL", "XXL");
    private static final List<String> PANT_SIZES  = Arrays.asList("28", "30", "32", "34", "36", "38");
    private static final List<String> SHOE_SIZES  = Arrays.asList("6", "7", "8", "9", "10", "11", "12");
    private static final List<String> ONE_SIZE     = Arrays.asList("One Size");

    @Override
    public void run(ApplicationArguments args) {
        // Seeder disabled — products managed manually via Admin Panel
        System.out.println("ℹ️ ProductDataSeeder is disabled. Skipping.");
    }

    private List<Product> buildCatalogue() {
        return Arrays.asList(

        // ═══════════════════════════════════════════════════════════════
        // T-SHIRTS  (30 products)
        // ═══════════════════════════════════════════════════════════════
        p("Classic White Tee", "Premium organic cotton crew-neck tee. Breathable, relaxed fit.", 799, "T-shirt",
          "https://images.unsplash.com/photo-1521572163-72573e3f02b4?w=600&fit=crop", 50,
          SHIRT_SIZES, Arrays.asList("White")),

        p("Jet Black Tee", "Soft-washed cotton jersey in midnight black. A wardrobe staple.", 799, "T-shirt",
          "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&fit=crop", 45,
          SHIRT_SIZES, Arrays.asList("Black")),

        p("Graphic Art Tee", "Oversized fit with hand-drawn graphic print on heavyweight cotton.", 1199, "T-shirt",
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&fit=crop", 35,
          SHIRT_SIZES, Arrays.asList("White", "Black", "Grey")),

        p("Charcoal Essential Tee", "Super-soft modal-blend tee with a relaxed silhouette.", 899, "T-shirt",
          "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&fit=crop", 40,
          SHIRT_SIZES, Arrays.asList("Charcoal", "White", "Navy")),

        p("Vintage Washed Tee", "Enzyme-washed for that perfectly worn-in feel.", 999, "T-shirt",
          "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&fit=crop", 30,
          SHIRT_SIZES, Arrays.asList("Sand", "Faded Black", "Sky Blue")),

        p("Longline Drop Shoulder Tee", "Extended hem tee with dropped shoulders. Street-ready silhouette.", 1299, "T-shirt",
          "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&fit=crop", 25,
          SHIRT_SIZES, Arrays.asList("Black", "Cream")),

        p("Henley Neck Tee", "Classic 3-button placket in fine jersey cotton.", 899, "T-shirt",
          "https://images.unsplash.com/photo-1585486386923-5a74fcc1f47c?w=600&fit=crop", 35,
          SHIRT_SIZES, Arrays.asList("White", "Navy", "Olive")),

        p("Stripe Ringer Tee", "Contrast collar and cuff stripes on a clean white base.", 999, "T-shirt",
          "https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=600&fit=crop", 28,
          SHIRT_SIZES, Arrays.asList("White/Black", "White/Navy")),

        p("V-Neck Slim Tee", "Tapered V-neck silhouette in breathable Pima cotton.", 849, "T-shirt",
          "https://images.unsplash.com/photo-1564859228273-274232faf38e?w=600&fit=crop", 40,
          SHIRT_SIZES, Arrays.asList("White", "Grey", "Black")),

        p("Raw Edge Tee", "Deconstructed raw hem edges give this tee an edgy finish.", 1099, "T-shirt",
          "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=600&fit=crop", 20,
          SHIRT_SIZES, Arrays.asList("Black", "White")),

        p("Logo Embroidered Tee", "Minimal logo embroidery at chest on premium combed cotton.", 1199, "T-shirt",
          "https://images.unsplash.com/photo-1588361861040-ac9b1018f6d5?w=600&fit=crop", 30,
          SHIRT_SIZES, Arrays.asList("Black", "White", "Forest Green")),

        p("Pocket Tee Essential", "Left chest patch pocket adds utilitarian detail to this classic.", 899, "T-shirt",
          "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&fit=crop", 35,
          SHIRT_SIZES, Arrays.asList("Olive", "Navy", "Stone")),

        p("Tie-Dye Surf Tee", "Vibrant hand-dyed patterns. No two are exactly alike.", 1299, "T-shirt",
          "https://images.unsplash.com/photo-1546961342-ea5f62d5a27b?w=600&fit=crop", 15,
          SHIRT_SIZES, Arrays.asList("Multi")),

        p("Muscle Fit Tank", "Body-hugging tank in stretch cotton blend. Gym to street.", 699, "T-shirt",
          "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&fit=crop", 40,
          SHIRT_SIZES, Arrays.asList("Black", "White", "Grey Marl")),

        p("Linen Blend Tee", "Lightweight linen-cotton blend. Ideal for warm weather.", 1099, "T-shirt",
          "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&fit=crop", 25,
          SHIRT_SIZES, Arrays.asList("Sand", "White", "Light Blue")),

        // ═══════════════════════════════════════════════════════════════
        // SHIRTS  (30 products)
        // ═══════════════════════════════════════════════════════════════
        p("Oxford Button-Down", "Classic Oxford weave with button-down collar. Versatile & sharp.", 1999, "Shirt",
          "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&fit=crop", 30,
          SHIRT_SIZES, Arrays.asList("White", "Light Blue", "Pink")),

        p("Chambray Casual Shirt", "Lightweight chambray fabric with a relaxed open-collar.", 1799, "Shirt",
          "https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=600&fit=crop", 25,
          SHIRT_SIZES, Arrays.asList("Medium Blue", "Stone")),

        p("Flannel Check Shirt", "Double-brushed flannel in classic heritage check. Supremely cosy.", 2199, "Shirt",
          "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&fit=crop", 20,
          SHIRT_SIZES, Arrays.asList("Red/Black", "Blue/Green", "Grey/Black")),

        p("Slim Dress Shirt", "Slim-fit poplin dress shirt. Essential for formal occasions.", 2499, "Shirt",
          "https://images.unsplash.com/photo-1516222338250-863216ce01ea?w=600&fit=crop", 25,
          SHIRT_SIZES, Arrays.asList("White", "Light Blue", "Black")),

        p("Cuban Collar Resort Shirt", "Camp collar in lightweight woven fabric. Holiday-ready.", 1999, "Shirt",
          "https://images.unsplash.com/photo-1598032895455-0e4e8f5b4f6e?w=600&fit=crop", 20,
          SHIRT_SIZES, Arrays.asList("Floral", "Plain White", "Cobalt")),

        p("Twill Overshirt", "Mid-weight twill fabric worn as a shirt or light layer.", 2599, "Shirt",
          "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&fit=crop", 18,
          SHIRT_SIZES, Arrays.asList("Khaki", "Olive", "Navy")),

        p("Linen Summer Shirt", "Relaxed-fit pure linen. Breathable and effortlessly elegant.", 2199, "Shirt",
          "https://images.unsplash.com/photo-1590159513274-3a7d56fd9e40?w=600&fit=crop", 20,
          SHIRT_SIZES, Arrays.asList("White", "Ecru", "Sky Blue", "Sage")),

        p("Mandarin Collar Shirt", "Clean mandarin collar with a subtle grandad-neck finish.", 1899, "Shirt",
          "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600&fit=crop", 22,
          SHIRT_SIZES, Arrays.asList("White", "Black", "Burgundy")),

        p("Denim Shirt", "Soft denim fabric shirt with Western-style chest pockets.", 2299, "Shirt",
          "https://images.unsplash.com/photo-1598032895455-0e4e8f5b4f6e?w=600&fit=crop", 20,
          SHIRT_SIZES, Arrays.asList("Light Wash", "Dark Wash")),

        p("Printed Silk-Touch Shirt", "Luxurious silk-touch satin weave in bold Italian-inspired print.", 2999, "Shirt",
          "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&fit=crop", 15,
          SHIRT_SIZES, Arrays.asList("Paisley", "Geometric", "Floral Navy")),

        p("Oversized Shirt Jacket", "Heavy-gauge woven shirt cut in an oversized silhouette.", 2799, "Shirt",
          "https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=600&fit=crop", 15,
          SHIRT_SIZES, Arrays.asList("Ecru", "Black", "Grey")),

        p("Heritage Stripe Shirt", "Vertical Bengal stripe on breathable cotton poplin.", 1999, "Shirt",
          "https://images.unsplash.com/photo-1516222338250-863216ce01ea?w=600&fit=crop", 22,
          SHIRT_SIZES, Arrays.asList("Blue/White", "Pink/White", "Navy/White")),

        p("Performance Dress Shirt", "4-way stretch fabric keeps you sharp all day. No ironing needed.", 2799, "Shirt",
          "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&fit=crop", 20,
          SHIRT_SIZES, Arrays.asList("White", "Light Blue", "Charcoal")),

        p("Cord Overshirt", "Soft-wale corduroy overshirt in rich autumn tones.", 2599, "Shirt",
          "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&fit=crop", 15,
          SHIRT_SIZES, Arrays.asList("Rust", "Forest Green", "Navy")),

        p("Relaxed Poplin Shirt", "Easy-fit poplin with an open collar and chest pocket.", 1699, "Shirt",
          "https://images.unsplash.com/photo-1590159513274-3a7d56fd9e40?w=600&fit=crop", 25,
          SHIRT_SIZES, Arrays.asList("White", "Sage", "Dusty Pink")),

        // ═══════════════════════════════════════════════════════════════
        // JACKETS  (35 products)
        // ═══════════════════════════════════════════════════════════════
        p("Classic Denim Jacket", "Vintage-wash denim with flattering tailored seaming.", 3999, "Jacket",
          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&fit=crop", 25,
          SHIRT_SIZES, Arrays.asList("Light Wash", "Dark Wash", "Black")),

        p("Bomber Jacket", "Lightweight bomber in satin-touch nylon with ribbed cuffs.", 4499, "Jacket",
          "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&fit=crop", 20,
          SHIRT_SIZES, Arrays.asList("Black", "Olive", "Navy", "Burgundy")),

        p("Wool Overcoat", "Double-breasted wool-blend overcoat for an elevated silhouette.", 8999, "Jacket",
          "https://images.unsplash.com/photo-1539533113208-f19d8573b6dc?w=600&fit=crop", 15,
          SHIRT_SIZES, Arrays.asList("Camel", "Charcoal", "Black", "Herringbone")),

        p("Leather Biker Jacket", "Genuine lamb leather biker jacket with asymmetric zip.", 12999, "Jacket",
          "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=600&fit=crop", 10,
          SHIRT_SIZES, Arrays.asList("Black", "Brown")),

        p("Puffer Jacket", "Lightweight 90/10 down fill puffer. Compressible and packable.", 5999, "Jacket",
          "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600&fit=crop", 20,
          SHIRT_SIZES, Arrays.asList("Black", "Navy", "Olive", "Burgundy")),

        p("Field Jacket", "Military-inspired multi-pocket field jacket in cotton canvas.", 4999, "Jacket",
          "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&fit=crop", 18,
          SHIRT_SIZES, Arrays.asList("Olive", "Khaki", "Black")),

        p("Harrington Jacket", "Iconic Harrington in water-repellent cotton-poly. Tartan lining.", 3999, "Jacket",
          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&fit=crop", 20,
          SHIRT_SIZES, Arrays.asList("Navy", "Tan", "Racing Green", "Red")),

        p("Teddy Fleece Jacket", "Ultra-soft teddy sherpa zip-up. Cosy weekend staple.", 3499, "Jacket",
          "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600&fit=crop", 15,
          SHIRT_SIZES, Arrays.asList("Cream", "Caramel", "Grey")),

        p("Track Jacket", "Retro-inspired track jacket with contrast zip and stripes.", 2999, "Jacket",
          "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&fit=crop", 20,
          SHIRT_SIZES, Arrays.asList("Black/White", "Navy/Red", "Green/White")),

        p("Windbreaker", "Lightweight packable windbreaker. Stows in its own chest pocket.", 3299, "Jacket",
          "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&fit=crop", 25,
          SHIRT_SIZES, Arrays.asList("Black", "Electric Blue", "Orange")),

        p("Quilted Gilet", "Lightweight quilted body warmer. Perfect layering piece.", 2799, "Jacket",
          "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600&fit=crop", 18,
          SHIRT_SIZES, Arrays.asList("Navy", "Olive", "Black", "Burgundy")),

        p("Suede Trucker Jacket", "Premium suede trucker in a tailored silhouette.", 9999, "Jacket",
          "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=600&fit=crop", 8,
          SHIRT_SIZES, Arrays.asList("Tan", "Brown", "Black")),

        p("Rain Mac", "Technical waterproof mac with taped seams. Storm-ready.", 5499, "Jacket",
          "https://images.unsplash.com/photo-1539533113208-f19d8573b6dc?w=600&fit=crop", 15,
          SHIRT_SIZES, Arrays.asList("Navy", "Khaki", "Black")),

        p("Utility Zip-Off Jacket", "Multi-pocket utility jacket with zip-off sleeves.", 4299, "Jacket",
          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&fit=crop", 12,
          SHIRT_SIZES, Arrays.asList("Khaki", "Black", "Olive")),

        p("Double-Breasted Peacoat", "Classic naval peacoat in boiled wool. Timeless elegance.", 7499, "Jacket",
          "https://images.unsplash.com/photo-1539533113208-f19d8573b6dc?w=600&fit=crop", 12,
          SHIRT_SIZES, Arrays.asList("Navy", "Black", "Charcoal")),

        p("Waxed Cotton Jacket", "Heritage waxed cotton with corduroy collar. Traditional craftsmanship.", 6999, "Jacket",
          "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=600&fit=crop", 10,
          SHIRT_SIZES, Arrays.asList("Olive", "Dark Brown", "Navy")),

        p("Shearling Aviator Jacket", "Genuine shearling lined aviator-style jacket.", 14999, "Jacket",
          "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=600&fit=crop", 6,
          SHIRT_SIZES, Arrays.asList("Tan/Cream", "Black/Grey")),

        p("Colourblock Puffer", "Bold colourblock panels on a lightweight down puffer.", 5499, "Jacket",
          "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=600&fit=crop", 18,
          SHIRT_SIZES, Arrays.asList("Black/White", "Navy/Orange", "Green/Grey")),

        // ═══════════════════════════════════════════════════════════════
        // PANTS / TROUSERS / JEANS  (35 products)
        // ═══════════════════════════════════════════════════════════════
        p("Slim Chinos", "Modern slim-fit chinos crafted from stretch cotton twill.", 2299, "Pants",
          "https://images.unsplash.com/photo-1560243563-062bfc511d34?w=600&fit=crop", 35,
          PANT_SIZES, Arrays.asList("Khaki", "Navy", "Stone", "Olive", "Burgundy")),

        p("Straight Leg Jeans", "Classic 5-pocket straight leg in rigid selvedge denim.", 3499, "Pants",
          "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&fit=crop", 30,
          PANT_SIZES, Arrays.asList("Indigo", "Dark Wash", "Black")),

        p("Slim Fit Jeans", "Clean slim taper in washed stretch denim. All-day comfort.", 2999, "Pants",
          "https://images.unsplash.com/photo-1542574271-7f3b92e6c821?w=600&fit=crop", 35,
          PANT_SIZES, Arrays.asList("Mid Blue", "Black", "Dark Indigo")),

        p("Tapered Jogger Trousers", "Tailored jogger silhouette in stretch ponte. Dress up or down.", 2599, "Pants",
          "https://images.unsplash.com/photo-1473966872/photo.jpg?w=600&fit=crop", 25,
          PANT_SIZES, Arrays.asList("Black", "Charcoal", "Navy")),

        p("Formal Dress Trousers", "Slim-cut formal trousers in fine wool-blend. Pressed crease.", 3999, "Pants",
          "https://images.unsplash.com/photo-1594938298870-5799049-photo?w=600&fit=crop", 20,
          PANT_SIZES, Arrays.asList("Black", "Charcoal", "Navy", "Grey")),

        p("Cargo Trousers", "Relaxed cargo trousers with multiple utility pockets.", 2799, "Pants",
          "https://images.unsplash.com/photo-1560243563-062bfc511d34?w=600&fit=crop", 25,
          PANT_SIZES, Arrays.asList("Khaki", "Black", "Olive", "Stone")),

        p("Wide-Leg Trousers", "Relaxed wide-leg silhouette. Modern take on tailored classics.", 3299, "Pants",
          "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&fit=crop", 20,
          PANT_SIZES, Arrays.asList("Beige", "Black", "Grey Marl")),

        p("Ripped Skinny Jeans", "Distressed skinny in super-stretch denim. Rock-inspired edge.", 3199, "Pants",
          "https://images.unsplash.com/photo-1542574271-7f3b92e6c821?w=600&fit=crop", 25,
          PANT_SIZES, Arrays.asList("Black", "Dark Blue", "Grey")),

        p("Linen Draw-String Trousers", "Relaxed linen trousers with elasticated waist. Weekend go-to.", 2499, "Pants",
          "https://images.unsplash.com/photo-1560243563-062bfc511d34?w=600&fit=crop", 20,
          PANT_SIZES, Arrays.asList("White", "Navy", "Ecru", "Sage")),

        p("Athlete Tracksuit Bottoms", "Technical fleece-backed sweatpants with tapered ankle.", 1999, "Pants",
          "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&fit=crop", 30,
          PANT_SIZES, Arrays.asList("Black", "Navy", "Grey Marl", "Burgundy")),

        p("Heritage Corduroy Trousers", "Mid-wale cord trousers in rich heritage tones.", 2999, "Pants",
          "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&fit=crop", 18,
          PANT_SIZES, Arrays.asList("Rust", "Forest Green", "Navy", "Sand")),

        p("Pleated Chinos", "Relaxed pleated cut for a sophisticated casual look.", 2799, "Pants",
          "https://images.unsplash.com/photo-1560243563-062bfc511d34?w=600&fit=crop", 20,
          PANT_SIZES, Arrays.asList("Ecru", "Olive", "Navy", "Stone")),

        p("Biker Jeans", "Raw-edge moto details with knee zip in rigid denim.", 3999, "Pants",
          "https://images.unsplash.com/photo-1542574271-7f3b92e6c821?w=600&fit=crop", 15,
          PANT_SIZES, Arrays.asList("Black", "Dark Indigo")),

        p("Wool Flannel Trousers", "Soft wool-flannel trousers. Timeless British tailoring.", 4999, "Pants",
          "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&fit=crop", 12,
          PANT_SIZES, Arrays.asList("Charcoal", "Mid Grey", "Navy")),

        // ═══════════════════════════════════════════════════════════════
        // BLAZERS  (20 products)
        // ═══════════════════════════════════════════════════════════════
        p("Single-Breasted Blazer", "Clean-lined blazer in stretch wool-blend. Office to evening.", 5999, "Blazer",
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&fit=crop", 15,
          SHIRT_SIZES, Arrays.asList("Navy", "Charcoal", "Black", "Mid Blue")),

        p("Linen Blazer", "Lightweight, unstructured linen blazer. Italian craftsmanship.", 5499, "Blazer",
          "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&fit=crop", 12,
          SHIRT_SIZES, Arrays.asList("Sand", "White", "Navy", "Mint")),

        p("Check Blazer", "Heritage windowpane check in a slim contemporary cut.", 6499, "Blazer",
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&fit=crop", 10,
          SHIRT_SIZES, Arrays.asList("Grey Check", "Navy Check", "Brown Check")),

        p("Double-Breasted Blazer", "Authoritative double-breasted styling in premium wool.", 7499, "Blazer",
          "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&fit=crop", 10,
          SHIRT_SIZES, Arrays.asList("Black", "Navy", "Pinstripe")),

        p("Velvet Dinner Jacket", "Tonal velvet blazer. The ultimate smart evening statement.", 8999, "Blazer",
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&fit=crop", 8,
          SHIRT_SIZES, Arrays.asList("Black", "Midnight Blue", "Deep Burgundy")),

        p("Unstructured Sports Jacket", "Soft-shouldered unlined sports coat. Effortless elegance.", 5999, "Blazer",
          "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&fit=crop", 12,
          SHIRT_SIZES, Arrays.asList("Tweed", "Herringbone", "Mid Grey")),

        p("Suede Blazer", "Genuine suede blazer in a slim fit. Luxury craftsmanship.", 11999, "Blazer",
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&fit=crop", 6,
          SHIRT_SIZES, Arrays.asList("Tan", "Chocolate", "Black")),

        p("Heritage Tweed Blazer", "Classic British tweed blazer with elbow patches.", 7999, "Blazer",
          "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&fit=crop", 10,
          SHIRT_SIZES, Arrays.asList("Brown Herringbone", "Grey Tweed")),

        p("Collarless Blazer", "Nehru-collar blazer in textured wool. Refined and distinctive.", 5999, "Blazer",
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&fit=crop", 8,
          SHIRT_SIZES, Arrays.asList("Black", "Navy", "Ivory")),

        p("Stretch Travel Blazer", "Wrinkle-resistant stretch blazer with a packable design.", 5499, "Blazer",
          "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&fit=crop", 15,
          SHIRT_SIZES, Arrays.asList("Black", "Navy", "Charcoal")),

        // ═══════════════════════════════════════════════════════════════
        // POLO SHIRTS  (15 products)
        // ═══════════════════════════════════════════════════════════════
        p("Classic Polo Shirt", "Fine-piqué polo in cotton with signature tipping.", 1799, "Polo",
          "https://images.unsplash.com/photo-1598032895455-0e4e8f5b4f6e?w=600&fit=crop", 30,
          SHIRT_SIZES, Arrays.asList("White", "Navy", "Black", "Sky Blue", "Red")),

        p("Slim Fit Polo", "Tailored slim polo in soft mercerised cotton.", 1999, "Polo",
          "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&fit=crop", 25,
          SHIRT_SIZES, Arrays.asList("Navy", "White", "Burgundy", "Forest Green")),

        p("Long-Sleeve Polo", "Polo extended to long sleeves for a refined layered look.", 2199, "Polo",
          "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&fit=crop", 20,
          SHIRT_SIZES, Arrays.asList("Navy", "Black", "Mid Blue")),

        p("Stripe Polo", "Breton-style horizontal stripes on a piqué polo base.", 1999, "Polo",
          "https://images.unsplash.com/photo-1585486386923-5a74fcc1f47c?w=600&fit=crop", 20,
          SHIRT_SIZES, Arrays.asList("Navy/White", "Red/White", "Green/White")),

        p("Performance Golf Polo", "Moisture-wicking stretch fabric. Engineered for the course.", 2299, "Polo",
          "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&fit=crop", 25,
          SHIRT_SIZES, Arrays.asList("White", "Grey", "Navy", "Coral")),

        p("Knitted Polo Sweater", "Fine-gauge knitted polo in lambswool. Luxury leisure wear.", 3299, "Polo",
          "https://images.unsplash.com/photo-1521572163-72573e3f02b4?w=600&fit=crop", 15,
          SHIRT_SIZES, Arrays.asList("Camel", "Navy", "Black", "Burgundy")),

        // ═══════════════════════════════════════════════════════════════
        // HOODIES & SWEATSHIRTS  (20 products)
        // ═══════════════════════════════════════════════════════════════
        p("Classic Hooded Sweatshirt", "400-gsm loopback cotton hoodie. Made to last.", 2999, "Hoodie",
          "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&fit=crop", 30,
          SHIRT_SIZES, Arrays.asList("Black", "Grey Marl", "Navy", "Stone", "Burgundy")),

        p("Zip-Up Hoodie", "Full-zip hoodie with kangaroo pockets and adjustable hood.", 3299, "Hoodie",
          "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&fit=crop", 25,
          SHIRT_SIZES, Arrays.asList("Black", "Charcoal", "Navy", "Olive")),

        p("Oversized Hoodie", "Dropped-shoulder, relaxed-fit hoodie in heavyweight fleece.", 3499, "Hoodie",
          "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&fit=crop", 20,
          SHIRT_SIZES, Arrays.asList("Washed Black", "Sand", "Pale Blue")),

        p("Crew Neck Sweatshirt", "Classic crewneck in organic loopback terry. Everyday essential.", 2499, "Hoodie",
          "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&fit=crop", 30,
          SHIRT_SIZES, Arrays.asList("Black", "Grey Marl", "White", "Forest Green")),

        p("Half-Zip Sweatshirt", "Sporty half-zip in brushed jersey. Collegiate-inspired.", 2799, "Hoodie",
          "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&fit=crop", 20,
          SHIRT_SIZES, Arrays.asList("Navy", "Burgundy", "Black", "Camel")),

        p("Printed Graphic Hoodie", "Oversized screen-print graphic on a heavyweight base.", 3499, "Hoodie",
          "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&fit=crop", 18,
          SHIRT_SIZES, Arrays.asList("Black", "White", "Cream")),

        p("Sherpa-Lined Hoodie", "Outer quilted shell with a sherpa fleece inner lining.", 4299, "Hoodie",
          "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&fit=crop", 15,
          SHIRT_SIZES, Arrays.asList("Black", "Navy", "Olive")),

        p("Vintage Wash Sweatshirt", "Pigment-dyed terry sweatshirt in vintage washed tones.", 2999, "Hoodie",
          "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&fit=crop", 20,
          SHIRT_SIZES, Arrays.asList("Faded Black", "Dusty Blue", "Brick Red")),

        // ═══════════════════════════════════════════════════════════════
        // ACTIVEWEAR  (15 products)
        // ═══════════════════════════════════════════════════════════════
        p("Running Shorts", "Lightweight 4-inch inseam shorts with liner. Engineered for speed.", 1499, "Activewear",
          "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&fit=crop", 35,
          SHIRT_SIZES, Arrays.asList("Black", "Grey", "Navy", "Red")),

        p("Compression Leggings", "4-way stretch compression tights. Muscle support & comfort.", 1999, "Activewear",
          "https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&fit=crop", 30,
          SHIRT_SIZES, Arrays.asList("Black", "Charcoal", "Navy")),

        p("Dry-Fit Training Top", "Mesh panels & moisture-wicking fabric for intense workouts.", 1799, "Activewear",
          "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&fit=crop", 30,
          SHIRT_SIZES, Arrays.asList("Black", "White", "Navy", "Red")),

        p("5-Pocket Gym Jogger", "Tapered gym joggers with zip ankle and utility pockets.", 2299, "Activewear",
          "https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&fit=crop", 25,
          PANT_SIZES, Arrays.asList("Black", "Grey Marl", "Burgundy")),

        p("Swim Shorts", "Quick-dry swim shorts with inner brief and side pockets.", 1699, "Activewear",
          "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&fit=crop", 30,
          Arrays.asList("S", "M", "L", "XL"), Arrays.asList("Navy", "Black", "Tropical Blue", "Camo")),

        p("Performance Zip-Off Pant", "Zip-off technical hiking trouser with UPF50+ fabric.", 3199, "Activewear",
          "https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&fit=crop", 15,
          PANT_SIZES, Arrays.asList("Khaki", "Black", "Stone")),

        // ═══════════════════════════════════════════════════════════════
        // FOOTWEAR  (20 products)
        // ═══════════════════════════════════════════════════════════════
        p("Suede Chelsea Boots", "Elastic-sided Chelsea boots in premium Italian suede.", 6999, "Footwear",
          "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&fit=crop", 20,
          SHOE_SIZES, Arrays.asList("Tan", "Black", "Brown", "Dark Burgundy")),

        p("White Leather Trainers", "Clean minimalist low-top leather sneaker. The everyday essential.", 4999, "Footwear",
          "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&fit=crop", 25,
          SHOE_SIZES, Arrays.asList("White", "Triple White", "White/Navy")),

        p("Oxford Brogues", "Full-brogue Oxford in Goodyear-welted calf leather.", 7999, "Footwear",
          "https://images.unsplash.com/photo-1612869538502-b2b1a89c0a76?w=600&fit=crop", 15,
          SHOE_SIZES, Arrays.asList("Dark Brown", "Black", "Tan", "Burgundy")),

        p("High-Top Canvas Sneakers", "Retro high-top canvas. Vulcanised rubber sole.", 2999, "Footwear",
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&fit=crop", 25,
          SHOE_SIZES, Arrays.asList("Black", "White", "Red", "Navy")),

        p("Monk Strap Shoes", "Double monk-strap in smooth calfskin. Smart-casual authority.", 6499, "Footwear",
          "https://images.unsplash.com/photo-1612869538502-b2b1a89c0a76?w=600&fit=crop", 12,
          SHOE_SIZES, Arrays.asList("Black", "Cognac", "Dark Brown")),

        p("Slip-On Loafers", "Penny-loafer in soft suede. Effortlessly stylish.", 4499, "Footwear",
          "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&fit=crop", 18,
          SHOE_SIZES, Arrays.asList("Tan", "Navy", "Black", "Burgundy")),

        p("Running Trainers", "Responsive cushioning foam with engineered mesh upper.", 3999, "Footwear",
          "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&fit=crop", 22,
          SHOE_SIZES, Arrays.asList("Black/White", "All Black", "Grey/Orange", "Navy/Red")),

        p("Desert Boots", "Crepe-soled boots in soft suede. An iconic silhouette.", 4999, "Footwear",
          "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&fit=crop", 15,
          SHOE_SIZES, Arrays.asList("Tan", "Sand", "Light Brown")),

        p("Chunky Sole Boots", "Lug-soled ankle boots with exposed zip. Bold and urban.", 5499, "Footwear",
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&fit=crop", 12,
          SHOE_SIZES, Arrays.asList("Black", "Dark Brown")),

        p("Boat Shoes", "Classic two-eye boat shoe in oiled leather with siped sole.", 3999, "Footwear",
          "https://images.unsplash.com/photo-1612869538502-b2b1a89c0a76?w=600&fit=crop", 18,
          SHOE_SIZES, Arrays.asList("Tan", "Navy", "Brown")),

        // ═══════════════════════════════════════════════════════════════
        // ACCESSORIES  (20 products)
        // ═══════════════════════════════════════════════════════════════
        p("Silk Pocket Square", "Hand-rolled 100% silk pocket square in geometric print.", 999, "Accessories",
          "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=600&fit=crop", 50,
          ONE_SIZE, Arrays.asList("Navy Paisley", "Burgundy Geo", "Ivory Floral")),

        p("Woven Leather Belt", "Full-grain leather belt with a brushed brass buckle.", 1999, "Accessories",
          "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=600&fit=crop", 30,
          Arrays.asList("28", "30", "32", "34", "36", "38", "40"), Arrays.asList("Black", "Tan", "Brown")),

        p("Wool Flat Cap", "Classic flat cap in herringbone wool tweed. Heritage styling.", 1499, "Accessories",
          "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&fit=crop", 25,
          Arrays.asList("S/M", "L/XL"), Arrays.asList("Grey Herringbone", "Brown Tweed", "Black")),

        p("Merino Wool Scarf", "Super-soft merino wool in a generous wrap-length scarf.", 1799, "Accessories",
          "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&fit=crop", 30,
          ONE_SIZE, Arrays.asList("Camel", "Charcoal", "Navy", "Burgundy", "Forest Green")),

        p("Aviator Sunglasses", "Gold-frame metal aviators with polarised gradient lenses.", 2999, "Accessories",
          "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&fit=crop", 20,
          ONE_SIZE, Arrays.asList("Gold/Brown", "Silver/Grey", "Black/Grey")),

        p("Leather Bifold Wallet", "Slim bifold in smooth top-grain leather. 6 card slots.", 1499, "Accessories",
          "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&fit=crop", 35,
          ONE_SIZE, Arrays.asList("Black", "Tan", "Navy", "Burgundy")),

        p("Canvas Tote Bag", "Heavy-duty waxed canvas tote with leather handles.", 2299, "Accessories",
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&fit=crop", 25,
          ONE_SIZE, Arrays.asList("Olive", "Charcoal", "Sand")),

        p("Slim-Fit Tie", "Woven silk tie in a 2.5-inch width. Classic business essential.", 1299, "Accessories",
          "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=600&fit=crop", 30,
          ONE_SIZE, Arrays.asList("Navy Stripe", "Burgundy Herringbone", "Charcoal")),

        p("Beanie Hat", "Ribbed-knit merino beanie with a turn-up cuff.", 1199, "Accessories",
          "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&fit=crop", 40,
          ONE_SIZE, Arrays.asList("Black", "Charcoal", "Navy", "Camel", "Burgundy")),

        p("Leather Messenger Bag", "Full-grain leather messenger with brass hardware and laptop sleeve.", 4999, "Accessories",
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&fit=crop", 15,
          ONE_SIZE, Arrays.asList("Tan", "Dark Brown", "Black")),

        p("Weekender Holdall", "Waxed canvas and leather trim weekender bag. 48-hour travel-ready.", 5499, "Accessories",
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&fit=crop", 12,
          ONE_SIZE, Arrays.asList("Olive/Tan", "Black/Black", "Navy/Tan")),

        p("Cufflinks Set", "Brushed silver or gold tone cufflinks with engraved detail.", 1499, "Accessories",
          "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&fit=crop", 25,
          ONE_SIZE, Arrays.asList("Silver", "Gold", "Black Enamel")),

        p("Canvas Backpack", "20L waxed-canvas backpack with rolled-top closure.", 3999, "Accessories",
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&fit=crop", 18,
          ONE_SIZE, Arrays.asList("Charcoal", "Olive", "Navy")),

        // ═══════════════════════════════════════════════════════════════
        // KNITWEAR & SWEATERS  (20 products)
        // ═══════════════════════════════════════════════════════════════
        p("Merino Crew-Neck Jumper", "Superfine 100% merino wool. Warm, lightweight, and itch-free.", 3499, "Knitwear",
          "https://images.unsplash.com/photo-1608522938234-ddbde5dba7d8?w=600&fit=crop", 20,
          SHIRT_SIZES, Arrays.asList("Navy", "Camel", "Black", "Grey", "Forest Green")),

        p("Roll-Neck Jumper", "Ribbed roll-neck in lambswool blend. Elegant winter warmth.", 3999, "Knitwear",
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&fit=crop", 18,
          SHIRT_SIZES, Arrays.asList("Black", "Camel", "Navy", "Ivory")),

        p("Cable-Knit Fisherman Sweater", "Heavy Aran-cable knit in natural ecru. Traditional craftsmanship.", 5499, "Knitwear",
          "https://images.unsplash.com/photo-1608522938234-ddbde5dba7d8?w=600&fit=crop", 12,
          SHIRT_SIZES, Arrays.asList("Ecru", "Grey", "Navy")),

        p("Quarter-Zip Sweater", "Fine-gauge knit quarter-zip in soft lambswool. Smart-casual versatile.", 3299, "Knitwear",
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&fit=crop", 15,
          SHIRT_SIZES, Arrays.asList("Navy", "Camel", "Burgundy", "Charcoal")),

        p("Cardigan", "Open-front button cardigan in pure lambswool. Timeless layering piece.", 3999, "Knitwear",
          "https://images.unsplash.com/photo-1608522938234-ddbde5dba7d8?w=600&fit=crop", 18,
          SHIRT_SIZES, Arrays.asList("Oatmeal", "Navy", "Charcoal", "Forest Green")),

        p("Fair Isle Jumper", "Fair Isle pattern in a traditional five-colour palette.", 4999, "Knitwear",
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&fit=crop", 10,
          SHIRT_SIZES, Arrays.asList("Natural/Navy", "Ecru/Red", "Grey/Blue")),

        p("Chunky Knit Hoodie", "Heavyweight oversized hoodie in knotted chunky yarn.", 4499, "Knitwear",
          "https://images.unsplash.com/photo-1608522938234-ddbde5dba7d8?w=600&fit=crop", 12,
          SHIRT_SIZES, Arrays.asList("Camel", "Cream", "Charcoal")),

        p("Sleeveless Knit Vest", "Crew-neck knitted waistcoat in fine merino. Layering essential.", 2999, "Knitwear",
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&fit=crop", 15,
          SHIRT_SIZES, Arrays.asList("Grey", "Navy", "Camel", "Forest Green")),

        p("Alpaca Blend Jumper", "Ultra-soft alpaca-merino blend in a relaxed silhouette.", 5999, "Knitwear",
          "https://images.unsplash.com/photo-1608522938234-ddbde5dba7d8?w=600&fit=crop", 10,
          SHIRT_SIZES, Arrays.asList("Ivory", "Oatmeal", "Pale Blue")),

        p("Stripe Knit Jumper", "Chunky horizontal stripes in contrasting yarn. Bold statement knitwear.", 3799, "Knitwear",
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&fit=crop", 15,
          SHIRT_SIZES, Arrays.asList("Navy/Ecru", "Black/White", "Red/Navy"))
        );
    }

    private Product p(String name, String desc, double price, String category,
                      String imageUrl, int stock, List<String> sizes, List<String> colors) {
        return Product.builder()
            .name(name)
            .description(desc)
            .price(price)
            .category(category)
            .imageUrl(imageUrl)
            .stock(stock)
            .sizes(sizes)
            .colors(colors)
            .multipleImages(Arrays.asList(imageUrl))
            .build();
    }
}
