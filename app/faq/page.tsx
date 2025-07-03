import MainLayout from '@/components/Layout/Layout';

export default function FAQPage() {
  return (
    <MainLayout>
      <div className='max-w-4xl mx-auto p-6'>
        <div className='bg-[#fbfbfb] p-6 rounded-lg shadow-md mb-8'>
          <h1 className='text-4xl font-extrabold text-center text-black mb-4'>Welcome to My Portfolio!</h1>
          <p className='text-black text-lg leading-relaxed'>
            This project was created to <strong>showcase my skills</strong> to potential employers. It is a{' '}
            <strong>Full-Stack application</strong> built using
            <strong> PostgreSQL, Nest.js, WebSockets, Next.js, and React.js</strong>, with all the code written in{' '}
            <strong>TypeScript</strong>.
          </p>

          <h2 className='text-2xl font-semibold text-black mt-4'>Key Features:</h2>
          <ul className='list-disc pl-5 mt-2 space-y-2 text-black text-lg'>
            <li>
              <strong>AI-powered tools</strong> – Offers <strong>pre-configured AI functionalities</strong> like text
              analysis, translation into various languages, and AI-powered content generation, powered by the{' '}
              <strong>OpenAI API</strong>.
            </li>

            <li>
              <strong>Collaborative sessions</strong> – Users can <strong>create and participate</strong> in real-time
              collaboration sessions, working together on documents.
            </li>
            <li>
              <strong>User invitations & role management</strong> – Invite others, manage invitations, and assign roles.
              Users can be <strong>administrators, editors, or visitors</strong>, each with specific permissions.
            </li>
            <li>
              <strong>Rich-text editing</strong> – The document editor, powered by the <strong>Quill library</strong>,
              allows formatting and <strong>document export</strong> (currently available for English only).
            </li>
            <li>
              <strong>Version control</strong> – Every document update is saved, enabling users to navigate different
              versions and restore previous edits.
            </li>
            <li>
              <strong>AI integration within the editor</strong> – Select content within a document and apply
              <strong>one of nine AI functions</strong> to enhance, modify, or analyze the text.
            </li>
          </ul>

          <h2 className='text-2xl font-semibold text-black mt-6'>Deployment & Hosting:</h2>
          <p className='text-black text-lg leading-relaxed'>This project is fully deployed and accessible online:</p>
          <ul className='list-disc pl-5 mt-2 space-y-2 text-black text-lg'>
            <li>
              <strong>Backend & Database:</strong> Hosted on{' '}
              <a href='https://render.com/' target='_blank' className='text-blue-500 underline'>
                Render
              </a>{' '}
              using <strong>Nest.js</strong> and <strong>PostgreSQL</strong>.
            </li>
            <li>
              <strong>Frontend:</strong> Deployed on{' '}
              <a href='https://vercel.com/' target='_blank' className='text-blue-500 underline'>
                Vercel
              </a>{' '}
              with <strong>Next.js</strong>.
            </li>
            <li>
              <strong>Custom Domain:</strong> A purchased domain is configured for both backend and frontend hosting.
            </li>
          </ul>

          <p className='text-black text-lg mt-4'>
            This project is designed to demonstrate my ability to build{' '}
            <strong>scalable, interactive, and AI-enhanced applications</strong> with a strong focus on real-time
            collaboration and intelligent automation.
          </p>
        </div>

        <h1 className='text-3xl font-bold mb-6 text-center'>Application Functional Description</h1>

        <div className='space-y-8'>
          <section>
            <h2 className='text-xl font-semibold'>1. User Authentication</h2>
            <p className='text-gray-600'>Secure access and account management.</p>
            <ul className='list-disc pl-5 mt-2 space-y-1 text-gray-700'>
              <li>
                Sign up with <strong>name, email, and password</strong>.
              </li>
              <li>
                Login using <strong>email and password</strong>.
              </li>
              <li>Reset password with email verification.</li>
            </ul>
          </section>

          <section>
            <h2 className='text-xl font-semibold'>2. Dashboard</h2>
            <p className='text-gray-600'>The central hub for accessing tools and features.</p>
          </section>

          <section>
            <h2 className='text-xl font-semibold'>3. AI Assistance Page</h2>
            <p className='text-gray-600'>Direct access to AI-powered text processing without joining a session.</p>
            <ul className='list-disc pl-5 mt-2 space-y-1 text-gray-700'>
              <li>Select an AI function, paste text, and get instant results.</li>
              <li>Use AI for creating, editing, translation, and more.</li>
            </ul>
          </section>

          <section>
            <h2 className='text-xl font-semibold'>4. Invitations & Notifications</h2>
            <p className='text-gray-600'>Stay informed with invitations and alerts.</p>
            <ul className='list-disc pl-5 mt-2 space-y-1 text-gray-700'>
              <li>Send invitations to join a session with specific roles.</li>
              <li>
                Receive notifications for <strong>invitations</strong>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-xl font-semibold'>5. User Collaboration & Sessions</h2>
            <p className='text-gray-600'>
              Users can collaborate in real-time through shared sessions, with flexible role-based permissions.
            </p>
            <ul className='list-disc pl-5 mt-2 space-y-1 text-gray-700'>
              <li>
                Start a session and assign roles: <strong>read, edit, admin</strong>.
              </li>
              <li>
                Track and update session duration with <strong>timeSpent</strong>.
              </li>
              <li>Live document editing with automatic sync.</li>
              <li>WebSocket-based real-time session tracking.</li>
              <li>Admin control over participant roles.</li>
              <li>View all active sessions linked to your account.</li>
              <li>Communicate in the real-time chat.</li>
            </ul>
          </section>

          <section>
            <h2 className='text-xl font-semibold'>6. Document Management</h2>
            <p className='text-gray-600'>
              Documents are at the core of collaboration, with real-time updates and AI integrations.
            </p>
            <ul className='list-disc pl-5 mt-2 space-y-1 text-gray-700'>
              <li>
                Edit <strong>content, rich content, and title</strong> in real-time.
              </li>
              <li>Create, duplicate, update, and delete documents.</li>
              <li>Track document version history for safe rollbacks.</li>
            </ul>
          </section>

          <section>
            <h2 className='text-xl font-semibold'>7. Version History</h2>
            <p className='text-gray-600'>Every time you save, a new document version is created.</p>
            <ul className='list-disc pl-5 mt-2 space-y-1 text-gray-700'>
              <li>View all versions linked to a document.</li>
              <li>Restore a previous version when needed.</li>
              <li>
                Each version stores <strong>content, timestamp, and metadata.</strong>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
