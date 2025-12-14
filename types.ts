
export enum Specialty {
  GENERAL = 'General Wall',
  SURGERY = 'Oral Surgery',
  ENDO = 'Endodontics',
  PEDO = 'Pediatric',
  PERIO = 'Periodontology',
  PROSTH = 'Prosthodontics',
  ORTHO = 'Orthodontics',
  COSMETIC = 'Cosmetic',
  CAFE = 'Dental Café'
}

export enum PostType {
  ARTICLE = 'ARTICLE',
  CASE = 'CASE',
  URGENT = 'URGENT',
  FUN = 'FUN',
  AD = 'AD'
}

export enum PostVisibility {
  PERSONAL = 'PERSONAL',   // Only on my profile/wall
  SPECIALTY = 'SPECIALTY', // On the specific specialty wall
  GENERAL = 'GENERAL',     // On the main general wall
  ALL = 'ALL'              // Everywhere
}

export enum ProfileVisibility {
  EVERYONE = 'EVERYONE',
  MEMBERS = 'MEMBERS',
  ONLY_ME = 'ONLY_ME'
}

export enum MessagePermission {
  EVERYONE = 'EVERYONE',
  SAME_SPECIALTY = 'SAME_SPECIALTY',
  NO_ONE = 'NO_ONE'
}

export enum UserRole {
  GP = "General Practitioner",
  BACHELOR_STUDENT = "Bachelor's Student",
  MASTER_STUDENT = "Master's Student",
  PROFESSOR = "Professor",
  ASSISTANT = "Assistant Dentist",
  COMPANY = "Private Dental Company"
}

export enum UserStatus {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE'
}

export enum ReactionType {
  LIKE = 'LIKE',           // Thumb Up
  LOVE = 'LOVE',           // Heart
  THINKING = 'THINKING',   // Gear
  SURPRISED = 'SURPRISED', // Exclamation Mark
  LEARNED = 'LEARNED'      // Light Bulb
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  THREE_D = 'THREE_D'
}

export interface PostMedia {
  type: MediaType;
  url: string; // For THREE_D, this stores the model type identifier (e.g., 'teeth')
}

export interface User {
  id: string;
  name: string;
  specialty: Specialty;
  role?: UserRole;
  avatar: string;
  isVerified: boolean;
  email?: string;
  status: UserStatus;
  profileVisibility: ProfileVisibility;
  isAdmin?: boolean; // New: Admin flag
  
  // New settings & social fields
  messagePermission: MessagePermission;
  followers: number;
  isFollowing?: boolean;
  isFriend?: boolean;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  timestamp: string;
  reactions?: Record<string, number>; // Simple count for comment reactions
  userHasReacted?: boolean;
  replies?: Comment[];
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  question?: string;
  options: PollOption[];
  userVotedOptionId?: string;
  totalVotes: number;
}

export interface AdConfig {
  startDate: string; // ISO Date string
  endDate: string;   // ISO Date string
  ctaLink?: string;
  ctaText?: string;
}

export interface Post {
  id: string;
  author: User;
  type: PostType;
  specialty: Specialty;
  title: string;
  content: string;
  media?: PostMedia[];
  visibility: PostVisibility;
  isAnonymous?: boolean;
  
  // Interactions
  isSaved?: boolean;
  allowComments?: boolean; // If false, commenting is disabled

  // Reactions
  reactions: Record<ReactionType, number>;
  userReaction?: ReactionType;

  // Polls
  poll?: Poll;
  
  // Ads
  adConfig?: AdConfig;

  comments: Comment[];
  timestamp: string;
  isUrgent?: boolean;
}

export interface MuseumCase {
  id: string;
  postId: string; // Link to original post
  title: string;
  image: string;
  doctor: User;
  rating: number; // 1-5
  patientReview: string;
  isFavorite: boolean;
  category: Specialty;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  condition: 'New' | 'Like New' | 'Used' | 'Refurbished';
  category: string;
  image: string;
  seller: User;
}

export interface Job {
  id: string;
  title: string;
  clinic: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Locum';
  salaryRange: string;
  postedDate: string;
  requirements: string[];
}

export interface SpecialtyStat {
  id: Specialty;
  membersCount: number;
  availableSpecialists: number;
  unavailableSpecialists: number;
  activeCount: number; // For "Most active members" count
  engagementLevel: number; // 0 to 100
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface BackgroundTheme {
  id: string;
  name: string;
  type: 'COLOR' | 'GRADIENT' | 'IMAGE';
  value: string;
}

export type ViewState = 'FEED' | 'MARKETPLACE' | 'JOBS' | 'PROFILE' | 'MEMBERS_LIST' | 'MESSAGES' | 'MUSEUM' | 'FAVORITES';
export type Language = 'en' | 'ar';
