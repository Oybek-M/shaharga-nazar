import './style.css';
import { mountTopBar } from './ui/Nav.js';
import { mountCameraGrid } from './ui/CameraGrid.js';

const uiRoot = document.getElementById('ui-root');
mountTopBar(uiRoot, 'cameras', 'Camera Monitoring');
mountCameraGrid(uiRoot);
