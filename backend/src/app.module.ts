import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ProductsModule } from "./products/products.module";
import { CategoriesModule } from "./categories/categories.module";
import { CollectionsModule } from "./collections/collections.module";
import { CartModule } from "./cart/cart.module";
import { OrdersModule } from "./orders/orders.module";
import { PaymentsModule } from "./payments/payments.module";
import { CurrencyModule } from "./currency/currency.module";
import { AdminModule } from "./admin/admin.module";
import { BannersModule } from "./banners/banners.module";
import { AddressesModule } from "./addresses/addresses.module";
import { WishlistModule } from "./wishlist/wishlist.module";
import { AnalyticsModule } from "./analytics/analytics.module";
// Temporarily disabled - will be re-enabled after fixing TypeScript errors
// import { SeoModule } from "./seo/seo.module";
// import { KeywordsModule } from "./keywords/keywords.module";
// import { BacklinksModule } from "./backlinks/backlinks.module";
import { EmailModule } from "./email/email.module";
import { ShippingModule } from "./shipping/shipping.module"; // Temporarily disabled to fix products
import { HealthModule } from "./health/health.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { SettingsModule } from "./settings/settings.module";
import { WalletModule } from "./wallet/wallet.module";
import { BrandsModule } from "./brands/brands.module";
import { ContactModule } from "./contact/contact.module";
import { DiscountCodesModule } from "./discount-codes/discount-codes.module";
import { NewsletterModule } from "./newsletter/newsletter.module";
import { BadgesModule } from "./badges/badges.module";
import { TrustBadgesModule } from "./trust-badges/trust-badges.module";
import { FlashSalesModule } from "./flash-sales/flash-sales.module";
import { BlogModule } from "./blog/blog.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    CollectionsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    CurrencyModule,
    AdminModule,
    BannersModule,
    AddressesModule,
    WishlistModule,
    AnalyticsModule,
    // Temporarily disabled - will be re-enabled after fixing TypeScript errors
    // SeoModule,
    // KeywordsModule,
    // BacklinksModule,
    ShippingModule,
    HealthModule,
    ReviewsModule,
    SettingsModule,
    WalletModule,
    BrandsModule,
    ContactModule,
    DiscountCodesModule,
    NewsletterModule,
    BadgesModule,
    TrustBadgesModule,
    FlashSalesModule,
    BlogModule,
    EmailModule,
  ],
})
export class AppModule {}
