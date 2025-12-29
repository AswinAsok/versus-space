import { supabase } from '../lib/supabaseClient';
import { createAuthFacade } from './application/auth/authFacade';
import { createPollFacade } from './application/polls/pollFacade';
import { createVoteFacade } from './application/votes/voteFacade';
import { createUserProfileFacade } from './application/userProfiles/userProfileFacade';
import { createSupabaseAuthGateway } from './infrastructure/supabase/authSupabaseGateway';
import { createSupabasePollGateway } from './infrastructure/supabase/pollSupabaseGateway';
import { createSupabaseVoteGateway } from './infrastructure/supabase/voteSupabaseGateway';
import { createSupabaseUserProfileGateway } from './infrastructure/supabase/userProfileSupabaseGateway';

const authGateway = createSupabaseAuthGateway(supabase);
const pollGateway = createSupabasePollGateway(supabase);
const voteGateway = createSupabaseVoteGateway(supabase);
const userProfileGateway = createSupabaseUserProfileGateway(supabase);

export const authFacade = createAuthFacade(authGateway);
export const pollFacade = createPollFacade(pollGateway);
export const voteFacade = createVoteFacade(voteGateway);
export const userProfileFacade = createUserProfileFacade(userProfileGateway);

export const appServices = {
  auth: authFacade,
  polls: pollFacade,
  votes: voteFacade,
  userProfiles: userProfileFacade,
};
