import * as cluster from 'cluster';
import { CpuInfo, cpus } from 'os';

class Clusters {

    private cpus: CpuInfo[];

    constructor() {
        this.cpus = cpus();
        this.init();
    }

    init(): void {
        if (cluster.isMaster) {

            console.log('MASTER...');

            this.cpus.forEach(() => cluster.fork());

            cluster.on('listening', (worker: cluster.Worker) => {
                console.log('Cluster %d connected', worker.process.pid);
            });

            cluster.on('disconnect', (worker: cluster.Worker) => {
                console.log('Cluster %d disconnect', worker.process.pid);
            });

            cluster.on('exit', (worker: cluster.Worker) => {
                console.log('Cluster %d exited', worker.process.pid);
                cluster.fork();
            });

        } else {
            console.log('WORKER...');
            require('./index');
        }
    }

}

export default new Clusters();