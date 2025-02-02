import MainLayout from '@/components/Dashboard/Layout';

export default function FAQPage() {
  return (
    <MainLayout>
      <div className='max-w-4xl mx-auto p-6'>
        <h1 className='text-3xl font-bold mb-6 text-center'>
          Application Functional Description
        </h1>

        <div className='space-y-8'>
          <section>
            <h2 className='text-xl font-semibold'>1. AI Tool List</h2>
            <p className='text-gray-600'>
              The platform provides various AI-driven tools to help users
              process and analyze text efficiently.
            </p>
            <ul className='list-disc pl-5 mt-2 space-y-1 text-gray-700'>
              <li>
                <strong>Grammar & Spell Check:</strong> Identifies and corrects
                errors in the text.
              </li>
              <li>
                <strong>Tone Analysis:</strong> Evaluates the formality and
                emotional tone of the text.
              </li>
              <li>
                <strong>Text Summarization:</strong> Condenses long-form text
                into key highlights.
              </li>
              <li>
                <strong>Rephrasing & Simplification:</strong> Improves clarity
                and readability of content.
              </li>
              <li>
                <strong>Translation:</strong> Converts text into multiple
                languages.
              </li>
              <li>
                <strong>Keyword Extraction:</strong> Identifies important
                phrases within the text.
              </li>
              <li>
                <strong>Text Generation:</strong> Produces relevant content
                based on user input.
              </li>
              <li>
                <strong>Readability Analysis:</strong> Evaluates the complexity
                of the text.
              </li>
              <li>
                <strong>Automatic Title Generation:</strong> Suggests suitable
                headings for documents.
              </li>
            </ul>
          </section>

          {/* Collaboration & Sessions */}
          <section>
            <h2 className='text-xl font-semibold'>
              2. User Collaboration & Sessions
            </h2>
            <p className='text-gray-600'>
              Users can collaborate in real-time through shared sessions, with
              flexible role-based permissions.
            </p>
            <ul className='list-disc pl-5 mt-2 space-y-1 text-gray-700'>
              <li>
                Start a session and assign roles:{' '}
                <strong>read, edit, admin</strong>.
              </li>
              <li>
                Track and update session duration with{' '}
                <strong>timeSpent</strong>.
              </li>
              <li>Live document editing with automatic sync.</li>
              <li>WebSocket-based real-time session tracking.</li>
              <li>Admin control over participant roles.</li>
              <li>View all active sessions linked to your account.</li>
              <li>Communicate in the real-time chat.</li>
            </ul>
          </section>

          {/* Documents */}
          <section>
            <h2 className='text-xl font-semibold'>3. Document Management</h2>
            <p className='text-gray-600'>
              Documents are at the core of collaboration, with real-time updates
              and AI integrations.
            </p>
            <ul className='list-disc pl-5 mt-2 space-y-1 text-gray-700'>
              <li>
                Edit <strong>content, rich content, and title</strong> in
                real-time.
              </li>
              <li>Create, duplicate, update, and delete documents.</li>
              <li>Retrieve AI-generated statistics</li>
              <li>Track document version history for safe rollbacks.</li>
              <li>
                Enable auto-save or save manually using{' '}
                <strong>Ctrl + S</strong>.
              </li>
            </ul>
          </section>

          {/* Version Control */}
          <section>
            <h2 className='text-xl font-semibold'>4. Version History</h2>
            <p className='text-gray-600'>
              Every time you save, a new document version is created.
            </p>
            <ul className='list-disc pl-5 mt-2 space-y-1 text-gray-700'>
              <li>View all versions linked to a document.</li>
              <li>Restore a previous version when needed.</li>
              <li>
                Each version stores{' '}
                <strong>content, timestamp, and metadata.</strong>
              </li>
            </ul>
          </section>

          {/* Invitations & Notifications */}
          <section>
            <h2 className='text-xl font-semibold'>
              5. Invitations & Notifications
            </h2>
            <p className='text-gray-600'>
              Stay informed with invitations and alerts.
            </p>
            <ul className='list-disc pl-5 mt-2 space-y-1 text-gray-700'>
              <li>Send invitations to join a session with specific roles.</li>
              <li>
                Receive notifications for <strong>invitations</strong>.
              </li>
            </ul>
          </section>

          {/* User Authentication */}
          <section>
            <h2 className='text-xl font-semibold'>6. User Authentication</h2>
            <p className='text-gray-600'>
              Secure access and account management.
            </p>
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

          {/* AI Tools Page */}
          <section>
            <h2 className='text-xl font-semibold'>7. AI Assistance Page</h2>
            <p className='text-gray-600'>
              Direct access to AI-powered text processing without joining a
              session.
            </p>
            <ul className='list-disc pl-5 mt-2 space-y-1 text-gray-700'>
              <li>
                Select an AI function, paste text, and get instant results.
              </li>
              <li>Use AI for creating, editing, translation, and more.</li>
            </ul>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
