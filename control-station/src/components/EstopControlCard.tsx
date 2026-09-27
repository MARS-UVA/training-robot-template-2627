import type { EstopActiveData } from '../hooks/useEstopData';
import { useEffect } from 'react';

type Props = {
  data: EstopActiveData | null;
  caller: (enable: boolean) => void
}

export function EstopControlCard({data, caller}: Props) {
    function toggleEstop() {
        if (data === null || data.data === undefined) {
            console.warn('E-Stop data is not available. Cannot toggle E-Stop.');
            return;
        }
        const newState = !data.data;
        caller(newState);
    }

    useEffect(() => {
        const estopStatusElement = document.getElementById('estop-status');
        if (estopStatusElement) {
            if (data === null || data.data === undefined) {
                estopStatusElement.textContent = 'unknown';
            } else {
                estopStatusElement.textContent = data.data ? 'Yes' : 'No';
            }
        }
    }, [data]);

  return (
    <div className="card">
      <h2>Emergency Stop</h2>
      <p>
        <button onClick={toggleEstop}>Toggle E-Stop</button>
      </p>
      <p>
        E-Stop active: <strong><code id="estop-status">unknown</code></strong>
      </p>
    </div>
  );
}