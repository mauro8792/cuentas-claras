"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBeneficiaryDto = exports.CreateBeneficiaryDto = exports.JoinWalletDto = exports.InviteMemberDto = exports.CreateCategoryDto = exports.UpdatePersonalExpenseDto = exports.CreatePersonalExpenseDto = exports.UpdateWalletDto = exports.CreateWalletDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateWalletDto {
}
exports.CreateWalletDto = CreateWalletDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Gastos Personales' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateWalletDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['PERSONAL', 'SHARED'], default: 'PERSONAL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['PERSONAL', 'SHARED']),
    __metadata("design:type", String)
], CreateWalletDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ARS', default: 'ARS' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWalletDto.prototype, "currency", void 0);
class UpdateWalletDto {
}
exports.UpdateWalletDto = UpdateWalletDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Mi Billetera' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateWalletDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'USD' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWalletDto.prototype, "currency", void 0);
class CreatePersonalExpenseDto {
}
exports.CreatePersonalExpenseDto = CreatePersonalExpenseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CreatePersonalExpenseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ARS', default: 'ARS' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePersonalExpenseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1050 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePersonalExpenseDto.prototype, "exchangeRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Alquiler departamento' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreatePersonalExpenseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePersonalExpenseDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['FIXED', 'VARIABLE'] }),
    (0, class_validator_1.IsEnum)(['FIXED', 'VARIABLE']),
    __metadata("design:type", String)
], CreatePersonalExpenseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'category-id-here' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePersonalExpenseDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'beneficiary-id-here' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePersonalExpenseDto.prototype, "beneficiaryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreatePersonalExpenseDto.prototype, "isRecurring", void 0);
class UpdatePersonalExpenseDto {
}
exports.UpdatePersonalExpenseDto = UpdatePersonalExpenseDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 15000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], UpdatePersonalExpenseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ARS' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePersonalExpenseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1050 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePersonalExpenseDto.prototype, "exchangeRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Alquiler actualizado' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdatePersonalExpenseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2024-01-15' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdatePersonalExpenseDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['FIXED', 'VARIABLE'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['FIXED', 'VARIABLE']),
    __metadata("design:type", String)
], UpdatePersonalExpenseDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'category-id-here' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePersonalExpenseDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'beneficiary-id-here' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePersonalExpenseDto.prototype, "beneficiaryId", void 0);
class CreateCategoryDto {
}
exports.CreateCategoryDto = CreateCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Gimnasio' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '💪' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '#FF5733' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "color", void 0);
class InviteMemberDto {
}
exports.InviteMemberDto = InviteMemberDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'usuario@email.com' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InviteMemberDto.prototype, "email", void 0);
class JoinWalletDto {
}
exports.JoinWalletDto = JoinWalletDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'abc123xyz' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], JoinWalletDto.prototype, "inviteCode", void 0);
class CreateBeneficiaryDto {
}
exports.CreateBeneficiaryDto = CreateBeneficiaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Pepe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateBeneficiaryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '🐕', default: '👤' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBeneficiaryDto.prototype, "icon", void 0);
class UpdateBeneficiaryDto {
}
exports.UpdateBeneficiaryDto = UpdateBeneficiaryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Pepe' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdateBeneficiaryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '🐕' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateBeneficiaryDto.prototype, "icon", void 0);
//# sourceMappingURL=wallet.port.js.map