////////////////////////////////////////////////////////////////////////////////////////////
// JSloth Sample App                                                                      //
//                                                                                        //
// The MIT License (MIT)                                                                  //
//                                                                                        //
// Copyright (C) 2017  Chriss Mejía - me@chrissmejia.com - chrissmejia.com                //
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

import * as fse from "fs-extra"
import * as repositories from "../models/db/repositoriesModel";
import * as _ from "lodash";

import HtmlController from "../../../system/abstract/controllers/html";
import JSloth from "../../../system/lib/core";

import { Request, Response } from "express";

/**
 * Index Controller
 * 
 * @basepath /health/
 */
export default class IndexController extends HtmlController {
    private repositoriesTable: repositories.Repositories;

    private md = require('markdown-it')({
        html: true,
        linkify: true,
        typographer: true
    }).use(require('markdown-it-highlightjs'));

    constructor(jsloth: JSloth, config: any, url: string, namespaces: string[]) {
        super(jsloth, config, url, namespaces);
        this.repositoriesTable = new repositories.Repositories(jsloth.db);
    }

    /*** Define routes */
    protected routes(): void {
        this.app.get("/", this.index);
        this.app.get("/:repository/", this.docs);
        this.app.get("/:repository/:level1", this.docs);
        this.app.get("/:repository/:level1/:level2", this.docs);
        this.router.use("/", this.app);
    }

    /**
     * Index view.
     *
     * @param req { Request } The request object.
     * @param res { Response } The response object.
     * @return html
     */
    private index = (req: Request, res: Response): void => {
        console.log(req.originalUrl);
        this.render(req, res, "index");
    };

    /**
     * Docs view.
     *
     * @param req { Request } The request object.
     * @param res { Response } The response object.
     * @return html
     */
    private docs = (req: Request, res: Response): void => {
        let main = this;
        let filepaths: string[] = [];
        let files: any;
        let level1 = req.params.level1;
        let level2 = req.params.level2;
        let repository = req.params.repository;

        // Vanilla url >
        let path = "/docs/" + repository + "/";

        if (typeof level1 !== "undefined") {
            let level = level1.split(".");
            if (level.length > 1) {
                return res.redirect(path + level[0] + "/");
            }
        }

        if (typeof level2 !== "undefined") {
            let level = level2.split(".");
            if (level.length > 1) {
                return res.redirect(path + level1 + "/" + level[0] + "/");
            }
        }

        if (level1 == "01-index") {
            return res.redirect(path);
        }
        // <

        if (typeof level1 === "undefined") {
            level1 = "01-index";
        }

        // Rewrite this to be more encapsuled >
        function getFilesNames(dir: string, base: string = "") {
            let fileList = fse.readdirSync(dir + base);
            fileList.forEach((file: string) => {
                let path = dir + base + file;
                if (fse.statSync(path).isDirectory()) {
                    getFilesNames(dir, base + file + "/");
                } else {
                    let filename: string[] = String((base + file)).split(".");
                    if (filename[1] == "md") {
                        filepaths.push(filename[0]);
                    }
                }
            });
        }

        function getFiles() {
            let fileRow = {};

            fileRow = {};
            filepaths.forEach((file: string) => {
                let tmp: any;
                let structure = file.split("/");
                fileRow = tmp = {};
                structure.forEach((key: string) => {
                    if (!tmp.hasOwnProperty(key)) {
                        tmp = tmp[key] = {};
                    } else {
                        tmp = tmp[key];
                    }
                });
                files = _.merge(files, fileRow)
            });
        }
        // rewrite <


        this.repositoriesTable.get({
            fields: ["folder"],
            where: { name: req.params.repository }
        }).then((data) => {
            let filepath = this.jsloth.context.baseURL + "repos/" + req.params.repository + data.folder + level1;
            if (typeof level2 !== "undefined") {
                filepath = filepath + "/" + level2;
            }
            filepath = filepath + ".md";
            getFilesNames(this.jsloth.context.baseURL + "repos/" + req.params.repository + data.folder)
            getFiles();
            fse.pathExists(filepath).then((exists) => {
                if (exists) {
                    fse.readFile(filepath, function (err: any, data: any) {
                        if (err) {
                            throw err;
                        }
                        let result = main.md.render(data.toString());
                        main.render(req, res, "md", {
                            'name': req.params.repository,
                            'level1': level1,
                            'level2': req.params.level2,
                            'main': result,
                            'menu': files
                        });
                    });
                } else {
                    return res.redirect("/errors/404/");
                }
            }).catch(err => {
                console.error("Something went wrong");
                console.error(err);
            });
        }).catch(err => {
            console.error(err);
            return res.status(500).send({
                success: false,
                message: "Can't access the database."
            });
        });

    };

}