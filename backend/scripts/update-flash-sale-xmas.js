"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var flashSale, allProducts, currentProductIds, availableProducts, productsToAdd, christmasEndDate, updatedFlashSale;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Updating flash sale to Christmas theme and adding products...");
                    return [4 /*yield*/, prisma.flashSale.findFirst({
                            where: { isActive: true },
                            include: {
                                products: true,
                            },
                        })];
                case 1:
                    flashSale = _a.sent();
                    if (!flashSale) {
                        console.log("No active flash sale found. Creating a new one...");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, prisma.product.findMany({
                            where: { isActive: true },
                            take: 50,
                        })];
                case 2:
                    allProducts = _a.sent();
                    currentProductIds = flashSale.products.map(function (p) { return p.productId; });
                    availableProducts = allProducts.filter(function (p) { return !currentProductIds.includes(p.id); });
                    productsToAdd = availableProducts.slice(0, 4);
                    console.log("Current products in flash sale: ".concat(currentProductIds.length));
                    console.log("Adding ".concat(productsToAdd.length, " more products..."));
                    if (!(productsToAdd.length > 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, prisma.flashSaleProduct.createMany({
                            data: productsToAdd.map(function (product) { return ({
                                flashSaleId: flashSale.id,
                                productId: product.id,
                            }); }),
                            skipDuplicates: true,
                        })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    christmasEndDate = new Date("2025-12-31T23:59:59Z");
                    return [4 /*yield*/, prisma.flashSale.update({
                            where: { id: flashSale.id },
                            data: {
                                title: "Christmas Mega Sale",
                                description: "Celebrate the holidays with amazing deals! Up to 30% off on selected hair products. Perfect gifts for yourself or loved ones!",
                                endDate: christmasEndDate,
                                discountPercent: 30.0,
                            },
                        })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, prisma.flashSale.findUnique({
                            where: { id: flashSale.id },
                            include: {
                                products: true,
                            },
                        })];
                case 6:
                    updatedFlashSale = _a.sent();
                    console.log("\n✅ Flash sale updated successfully!");
                    console.log("- Title: ".concat(updatedFlashSale === null || updatedFlashSale === void 0 ? void 0 : updatedFlashSale.title));
                    console.log("- Total products: ".concat(updatedFlashSale === null || updatedFlashSale === void 0 ? void 0 : updatedFlashSale.products.length));
                    console.log("- End date: ".concat(updatedFlashSale === null || updatedFlashSale === void 0 ? void 0 : updatedFlashSale.endDate));
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
