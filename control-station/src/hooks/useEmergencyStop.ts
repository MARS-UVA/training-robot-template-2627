import { useEffect, useState } from 'react';
import { Topic, type Ros } from 'roslib';

export type Bool = { data: boolean };

export function useEmergencyStop(ros: Ros | null) {
    const [data, setData] = useState<Bool>({
        data: false
    });

    useEffect(() => {
        if (!ros) return;

        const sub = new Topic<Bool>({
            ros,
            name: '/estop_active',
            messageType: 'std_msgs/msg/Bool',
        });

        sub.subscribe((msg) => {
            setData((prev) => ({ ...prev, data: msg.data }));
        });

        return () => {
            sub.unsubscribe();
        }
    }, [ros]);

    return data
}
