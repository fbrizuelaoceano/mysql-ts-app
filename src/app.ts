import express,{Application} from 'express';
import morgan from 'morgan';

//Routes
import IndexRoutes from './routes/index.routes';
import PostRoutes from './routes/post.routes'; 
import ZohoCRMRoutes from './routes/zohocrm.routes'; 


export class App {

    private app: Application;

    constructor(private port?: number|string){
        this.app = express();
        this.settings();
        this.middlewares();
        this.routes();
    }

    settings(){
        this.app.set('port',this.port || process.env.PORT || 3000);
    }

    routes(){
        this.app.use(IndexRoutes);
        this.app.use('/posts', PostRoutes);
        this.app.use('/zohocrm', ZohoCRMRoutes);
    }

    middlewares(){
        this.app.use(morgan('dev'));
        this.app.use(express.json());
    }

    async listen(){
        await this.app.listen(this.app.get('port'));
        console.log("Server on port", this.app.get('port'))
    }

}