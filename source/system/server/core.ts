////////////////////////////////////////////////////////////////////////////////////////////
// The MIT License (MIT)                                                                  //
//                                                                                        //
// Copyright (C) 2016  Chriss Mejía - me@chrissmejia.com - chrissmejia.com                //
//                                                                                        //
// Permission is hereby granted, free of charge, to any person obtaining a copy           //
// of this software and associated documentation files (the "Software"), to deal          //
// in the Software without restriction, including without limitation the rights           //
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell              //
// copies of the Software, and to permit persons to whom the Software is                  //
// furnished to do so, subject to the following conditions:                               //
//                                                                                        //
// The above copyright notice and this permission notice shall be included in all         //
// copies or substantial portions of the Software.                                        //
//                                                                                        //
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR             //
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,               //
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE            //
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER                 //
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,          //
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE          //
// SOFTWARE.                                                                              //
////////////////////////////////////////////////////////////////////////////////////////////

import * as app from "../interfaces/app";
import * as bodyParser from "body-parser"; // Parse incoming request bodies
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";  // Log requests

import Apps from "./apps";
import Sessions from "../apps/auth/middlewares/sessions";
import SysConfig from "../interfaces/config";
import JSFiles from "../lib/files";
import JSloth from "../lib/core";
import Log from "./log";

/**
 * Creates and configure an ExpressJS web server.
 *
 * @return express.Application
 */
export default class Core {
    /*** Express instance */
    public express: express.Application;

    /**
     * Stores the app port
     * @default port System environment port or 3000
     * Please note: the unary + cast to number
     */
    protected port: number = +process.env.PORT || 8080;

    /*** Default configuration filepath */
    protected configPath: string = "/../../../config.json";

    /*** Configuration object */
    protected config: SysConfig;

    /*** Apps object */
    protected apps: app.App[] = [];

    /*** JSloth library */
    protected jsloth: JSloth;

    /**
     * Load configuration settings, set up JSloth Global Library and start installation.
     */
    constructor() {
        // Loading JSloth Files directly to load the config file.
        let jslothFiles = new JSFiles();

        // Creating App
        this.express = express();

        Log.hello();

        // Mount static files
        Log.module("Static files published");
        this.express.use('/', express.static(__dirname + '/../../../dist/angular/browser/', { index: false, extensions: ['html', 'js', 'css'] }));
        this.express.use('/', express.static(__dirname + '/../../../dist/static/'));


        // Loading Configuration
        jslothFiles.exists(__dirname + this.configPath).then(() => {
            this.config = require(__dirname + this.configPath);
            this.express.set("token", this.config.token); // secret token
            Log.module("Configuration loaded");
            this.install();
        }).catch(err => {
            if (err.code === "ENOENT") {
                Log.error("Configuration file not found");
            } else {
                Log.error("Something went wrong");
            }
            Log.error(err);
        });
    }

    /**
     * Install endpoints, configure and run the Express App instance and load middlewares
     */
    protected install(): void {
        let appsModule: Apps;
        // Loading JSloth Global Library
        this.jsloth = new JSloth(this.config, __dirname);
        this.express.set("jsloth", this.jsloth);
        Log.module("Core library loaded");

        // Installing Middlewares
        this.middleware();

        // Installing Apps
        appsModule = new Apps(this.config, this.jsloth, this.express);
        appsModule.install((apps: app.App[]) => {
            this.apps = apps;
            this.start();
        });
    }

    /*** Configure Express middlewares */
    protected middleware(): void {
        let auth_config = this.config.system_apps.find((x: any) => x.name == 'auth');
        let sessions = new Sessions(this.jsloth, auth_config);
        // Log hits using morgan
        if (this.jsloth.config.dev) {
            this.express.use(logger("dev"));
        } else {
            this.express.use(logger("combined"));
        }
        // Use body parser so we can get info from POST and/or URL parameters
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
        this.express.use(cookieParser(this.config.token));
        this.express.use(sessions.context);        
        Log.module("Middlewares loaded");
    }

    /*** Run the server */
    protected start(): void {
        let appCount = 0; // Number of checked apps so far
        let done = true; // All done

        let now = () => {
            // Everything is installed?
            if (done) {
                try {
                    this.express.listen(this.port);
                    Log.run(this.port);
                } catch (e) {
                    Log.error(e);
                }
            }
        };

        this.apps.forEach((app) => {
            if (!app.done) {
                done = false;
            }
            appCount++;
            if (this.apps.length === appCount) {
                now();
            }
        });

    }

}