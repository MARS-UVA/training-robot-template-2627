import { useEffect, useState, useCallback, useRef } from 'react';
import { Topic, Service, type Ros } from 'roslib';
// import Service from 'roslib';

// export type EstopData = { isStopped: boolean };
export type Bool = { data: boolean };

export function useEmergencyStop(ros: Ros | null) {
    const [data, setData] = useState<Bool>({
        data: false
    });

    const srv = useRef<Service<Bool, Bool> | null>(null);

    useEffect(() => {
        if (!ros) return;

        srv.current = new Service<Bool, Bool>({
            ros,
            name: 'estop_robot',
            serviceType: 'software_estop/EstopRobot'
        });

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
            srv.current = null;
        }
    }, [ros]);

    const toggleEstop = useCallback(() => {
        if (!ros) return;

        srv.current?.callService({ enable: !data.data }, (res: any) => {
            console.log('response: ', res);
        }, (err: string) => {
            console.log('FAILURE! ' + err);
        }, 10)
    }, [ros, srv, data]);

    return { data, toggleEstop }
}
