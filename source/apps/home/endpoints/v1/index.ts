////////////////////////////////////////////////////////////////////////////////////////////
// JSloth Health App                                                                      //
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

import * as repositories from "../../models/db/repositoriesModel";

import ApiController from "../../../../system/abstract/controllers/api";
import Batch from "../../../../system/server/batch";
import JSloth from "../../../../system/lib/core";

import { Request, Response } from "express";

/**
 * Index Endpoint 
 * 
 * @basepath /
 * @return express.Router
 */
export default class IndexEndPoint extends ApiController {
    private repositoriesTable: repositories.Repositories;

    /*** Batch server library */
    private batch: Batch;

    constructor(jsloth: JSloth, config: any, url: string, namespaces: string[]) {
        super(jsloth, config, url, namespaces);
        this.repositoriesTable = new repositories.Repositories(jsloth);
        this.batch = new Batch(jsloth);
    }

    /*** Define routes */
    protected routes(): void {
        this.router.get("/", this.all);
        // this.router.put("/sync/:id/", this.sync);
        this.router.post("/new/", this.add);
        this.router.delete("/:id/", this.rm);
    }

    /**
     * Get all repositories
     * Render a json object with a true response.
     *
     * @param req { Request } The request object.
     * @param res { Resgetgetponse } The response object.
     * @return json
     */
    private all = (req: Request, res: Response): void => {
        this.repositoriesTable.getAll().then((data) => {
            res.json(data);
        }).catch(err => {
            console.error(err);
            return res.status(500).send({
                success: false,
                message: "Something went wrong."
            });
        });
    };

    /**
     * Remove repository
     * Render a json object with a true response.
     *
     * @param req { Request } The request object.
     * @param res { Response } The response object.
     * @return json
     */
    private rm = (req: Request, res: Response): void => {
        this.repositoriesTable.get(["name"], { id: req.params.id }).then((data) => {
            this.batch.rm(this.jsloth.context.baseURL + "/repos/" + data.name + "/")
                .then(() => {
                    this.repositoriesTable.delete({ id: req.params.id }).then((data) => {
                        res.json({
                            success: true,
                            message: "Deleted."
                        });
                    }).catch(err => {
                        res.status(500).send({
                            success: false,
                            message: "Can't remove from database.",
                            err: err
                        })
                    });
                }).catch(err => {
                    res.status(500).send({
                        success: false,
                        message: "Can't remove folder from server.",
                        err: err
                    })
                });
        }).catch(err => {
            console.error(err);
            return res.status(500).send({
                success: false,
                message: "Can't access the database."
            });
        });
    };

    /**
     * Add repository
     * Render a json object with a true response.
     *
     * @param req { Request } The request object.
     * @param res { Response } The response object.
     * @return json
     */
    private add = (req: Request, res: Response): void => {
        let repositoryURL = req.body.url;
        this.repositoriesTable.insert({
            name: req.body.name,
            url: repositoryURL,
            mount: req.body.mount,
            folder: req.body.folder
        }).then((data) => {
            require('simple-git/promise')(this.jsloth.context.baseURL + 'repos/').silent(true)
                .clone(repositoryURL)
                .then(() => {
                    res.json({
                        success: true,
                        message: "New repository."
                    });
                })
                .catch((err: any) => {
                    res.status(500).send({
                        success: false,
                        message: "Can't clone repository.",
                        err: err
                    })
                });
        }).catch(err => {
            res.status(500).send({
                success: false,
                message: "Can't insert into the db.",
                err: err
            })
        });
    };

}