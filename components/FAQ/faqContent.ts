import { FiBookOpen, FiGrid, FiUsers, FiFileText, FiUser } from 'react-icons/fi';

export const categories = [
  { id: 'all', label: 'All topics', icon: FiBookOpen },
  { id: 'start', label: 'Getting started', icon: FiGrid },
  { id: 'sessions', label: 'Sessions & teamwork', icon: FiUsers },
  { id: 'documents', label: 'Documents & AI', icon: FiFileText },
  { id: 'account', label: 'Your account', icon: FiUser },
];

export const questions = [
  {
    category: 'start',
    question: 'What can I do with AI Editor?',
    answer:
      'Create sessions to organize shared documents, invite collaborators, and write with rich text formatting. You can use nine AI tools inside a document or start a separate request from AI Assistance.',
  },
  {
    category: 'start',
    question: 'How do I create my first document?',
    answer:
      'On Dashboard, click Create a session and enter a session name. Open the session, click New document, and enter a document title. In a session created by someone else, you need edit access to create documents.',
  },
  {
    category: 'sessions',
    question: 'How do I invite someone to a session?',
    answer:
      'With edit access, open the session and click Invite collaborators. Enter the email of an existing AI Editor account and choose Viewer or Editor. The recipient can accept the invitation from their notifications. Invitations expire after seven days.',
  },
  {
    category: 'sessions',
    question: 'What can Viewers, Editors, and Admins do?',
    answer:
      'Viewers can read documents and use session chat. Editors can also create, edit, rename, duplicate, and delete documents, use document AI tools, restore versions, and invite collaborators. The session creator has Admin access and can rename or delete the session and change participant permissions.',
  },
  {
    category: 'sessions',
    question: 'How does collaboration work?',
    answer:
      'Open the same document in a shared session. Saved changes sync to the other participants. The header shows who is online and your time in the session. Click Session chat to send messages to everyone in that session.',
  },
  {
    category: 'sessions',
    question: 'Where do I find invitations?',
    answer:
      'Go to Dashboard and click the bell in the header. You can accept an invitation, mark it as read, or remove its notification. After accepting, open the session from your dashboard.',
  },
  {
    category: 'documents',
    question: 'How are my document changes saved?',
    answer:
      'Changes save automatically shortly after you stop typing. Keep your connection active so updates can reach the server. Use the editor toolbar for headings, lists, alignment, and text styles; there is no separate Save button.',
  },
  {
    category: 'documents',
    question: 'Can I restore an earlier version?',
    answer:
      'With edit access, open Version history in the document header. Select an earlier version and click Apply version to restore it. While previewing, the document is read-only. Click Back to current or close the drawer to leave the preview without restoring it.',
  },
  {
    category: 'documents',
    question: 'How do I use AI with a document?',
    answer:
      'With edit access, click AI Assistance in the document header and choose a tool. Type your input or click Select from the document, highlight a passage, and click Submit. Translation also requires a target language. The result opens in the AI window for review.',
  },
  {
    category: 'documents',
    question: 'How do I insert an AI result into my document?',
    answer:
      'In the AI result window, click Paste in document. The result is added as new paragraphs at the end of the current document and saved automatically. Existing text is kept. You can also click Copy and paste the text yourself. Insertion is unavailable in a version preview or without edit access.',
  },
  {
    category: 'documents',
    question: 'Where can I find my previous AI results?',
    answer:
      'Open AI Assistance from the sidebar and scroll to the request history. Search your previous inputs, click View result to open a request, and copy its result if needed. Both standalone requests and requests made inside documents appear here.',
  },
  {
    category: 'documents',
    question: 'Can I use the AI tools without a session?',
    answer:
      'Yes. Open AI Assistance from the sidebar and click Start a new request. Choose a tool on the first step, enter your input, and submit. The nine tools cover grammar, tone, summarization, rephrasing, translation, keywords, text generation, readability, and titles.',
  },
  {
    category: 'documents',
    question: 'Can I export a document?',
    answer:
      'Click Export to PDF in the document header to download a PDF. You can also export from the document card menu in a session. Check the downloaded file if your text uses non-Latin characters: the current PDF font may not display them correctly.',
  },
  {
    category: 'account',
    question: 'How do I update my name or profile photo?',
    answer:
      'Go to Dashboard and click the settings icon in the header to open Profile settings. Change your display name or upload a photo, then click Save changes. Your email address is displayed for reference and cannot be edited there.',
  },
  {
    category: 'account',
    question: 'How do I reset my password?',
    answer:
      'Choose Forgot password on the sign-in page, enter your account email, and follow the reset link sent to your inbox. Your new password must have at least eight characters, one uppercase letter, and one number.',
  },
];
