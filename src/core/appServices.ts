export { authFacade } from './infrastructure/supabase/authSupabaseGateway';
import { cloudflarePollFacade } from './infrastructure/cloudflare/pollCloudflareGateway';
import { cloudflareRealtimeFacade } from './infrastructure/cloudflare/realtimeCloudflareGateway';
import { cloudflareUserProfileFacade } from './infrastructure/cloudflare/userProfileCloudflareGateway';
import { cloudflareVoteFacade } from './infrastructure/cloudflare/voteCloudflareGateway';
import { pollFacade as supabasePollFacade } from './infrastructure/supabase/pollSupabaseGateway';
import { supabaseRealtimeFacade } from './infrastructure/supabase/realtimeSupabaseGateway';
import { userProfileFacade as supabaseUserProfileFacade } from './infrastructure/supabase/userProfileSupabaseGateway';
import { voteFacade as supabaseVoteFacade } from './infrastructure/supabase/voteSupabaseGateway';

export const dataBackend =
  import.meta.env.VITE_DATA_BACKEND === 'supabase' ? 'supabase' : 'cloudflare';
export const pollFacade = dataBackend === 'cloudflare' ? cloudflarePollFacade : supabasePollFacade;
export const voteFacade = dataBackend === 'cloudflare' ? cloudflareVoteFacade : supabaseVoteFacade;
export const userProfileFacade =
  dataBackend === 'cloudflare' ? cloudflareUserProfileFacade : supabaseUserProfileFacade;
export const realtimeFacade =
  dataBackend === 'cloudflare' ? cloudflareRealtimeFacade : supabaseRealtimeFacade;
