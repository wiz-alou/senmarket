export * from './client';
export * from './types';

// Services
export { authService } from './services/auth.service';
export { listingsService } from './services/listings.service';
export { categoriesService } from './services/categories.service';
export { imagesService } from './services/images.service';
export { contactsService } from './services/contacts.service';
export { paymentsService } from './services/payments.service';
export { dashboardService } from './services/dashboard.service';
export { regionsService } from './services/regions.service';

// Types exportés
export type {
  User,
  Category,
  Listing,
  Contact,
  Payment,
  DashboardStats,
  LoginRequest,
  RegisterRequest,
  CreateListingRequest,
  ContactSellerRequest,
  PaymentRequest,
  PaginatedResponse,
  ApiResponse,
  UploadedImage
} from './types';