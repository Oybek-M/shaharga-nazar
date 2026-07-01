import './style.css';
import { mountTopBar } from './ui/Nav.js';
import { mountUploadPanel } from './ui/UploadPanel.js';
import { createAnalysisService } from './ai/AnalysisService.js';

const uiRoot = document.getElementById('ui-root');
mountTopBar(uiRoot, 'upload', 'Upload & Analyze');

const analysisService = createAnalysisService();
mountUploadPanel(uiRoot, analysisService);
