import './style.css';
import { mountTopBar } from './ui/Nav.js';
import { mountIssuesList } from './ui/IssuesList.js';

const uiRoot = document.getElementById('ui-root');
mountTopBar(uiRoot, 'issues', 'Aniqlangan muammolar');
mountIssuesList(uiRoot);
