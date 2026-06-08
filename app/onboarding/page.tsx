// app/onboarding/page.tsx
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { completeOnboarding } from '../actions/onboarding';
import './styles.css'; // Uses your local signup CSS

export default async function Onboarding() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // If they already have a role, send them to the app
  if (profile?.role) redirect('/browse');

  return (
    <div className="signup-layout">
      <div className="left-panel" style={{background: 'linear-gradient(135deg,#FBE8D8,#F5C9A0,#E8A87C)'}}>
        <h1 className="right-title" style={{color: 'var(--dark)'}}>Almost there!</h1>
        <p style={{ color: 'var(--mid)', marginTop: '16px', maxWidth: '300px', textAlign: 'center' }}>
          Tell us a little bit about how you want to use the FurriHearts platform.
        </p>
      </div>

      <div className="right-panel">
        <div className="right-inner">
          <h2 className="right-title">Complete your profile</h2>
          <p className="right-sub">We just need a few details to get you started.</p>

          /* Instead of action={completeOnboarding}
 Use an anonymous function wrapper: */
<form action={async (formData) => {
  const result = await completeOnboarding(formData);
  if (result?.error) {
    // Handle the error (e.g., set a local state variable to show it on screen)
    console.error(result.error);
  }
}}>
            
            {/* First and Last Name */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div className="form-field" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">First Name</label>
                <input name="firstName" className="form-input" type="text" placeholder="First" required />
              </div>
              <div className="form-field" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Last Name</label>
                <input name="lastName" className="form-input" type="text" placeholder="Last" required />
              </div>
            </div>

            {/* Email Display (Read-Only to show what Google provided) */}
            <div className="form-field" style={{ marginBottom: '24px' }}>
              <label className="form-label">Account Email</label>
              <input 
                className="form-input" 
                type="email" 
                defaultValue={user.email} 
                disabled 
                style={{ backgroundColor: 'var(--cream)', color: 'var(--mid)', cursor: 'not-allowed' }}
              />
            </div>

            {/* Role Selection mapping directly to your 3 purpose options */}
            <div className="form-field">
              <label className="form-label">I am a...</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                
                <label style={{ border: '1.5px solid var(--border)', borderRadius: '12px', padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="radio" name="role" value="adopter" required />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--dark)' }}>Pet Adopter</div>
                    <div style={{ fontSize: '12px', color: 'var(--light)' }}>I am looking to find a new furry friend.</div>
                  </div>
                </label>

                <label style={{ border: '1.5px solid var(--border)', borderRadius: '12px', padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="radio" name="role" value="rescuer" required />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--dark)' }}>Pet Rescuer / Shelter</div>
                    <div style={{ fontSize: '12px', color: 'var(--light)' }}>I want to list rescued pets for adoption.</div>
                  </div>
                </label>

                <label style={{ border: '1.5px solid var(--border)', borderRadius: '12px', padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="radio" name="role" value="both" required />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--dark)' }}>Both</div>
                    <div style={{ fontSize: '12px', color: 'var(--light)' }}>I rescue pets and also want to adopt.</div>
                  </div>
                </label>

              </div>
            </div>

            <button type="submit" className="btn-login" style={{ marginTop: '32px' }}>
              Finish Setup
            </button>
            
          </form>
        </div>
      </div>
    </div>
  );
}