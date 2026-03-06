import ControlsBar from '../components/controls/ControlsBar';
import GraphCanvas from '../components/canvas/GraphCanvas';
import AlgorithmStatePanel from '../components/panels/AlgorithmStatePanel';
import './PathFindingPage.css';

/*
  PathFindingPage -- the main workspace for path-finding algorithms.

  Layout:
    [ControlsBar]
    [Canvas (flex:1)] | [StatePanel (320px)]

  The canvas fills all available space; the state panel is fixed-width on the right.
*/

export default function PathFindingPage() {
  return (
    <div className="pathfinding-page">
      <ControlsBar />
      <div className="pathfinding-page__workspace">
        <div className="pathfinding-page__canvas-area">
          <GraphCanvas />
        </div>
        <AlgorithmStatePanel />
      </div>
    </div>
  );
}
