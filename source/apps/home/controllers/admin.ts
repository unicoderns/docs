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

import HtmlController from "../../../system/abstract/controllers/html";
import { Request, Response } from "express";

/**
 * Index Controller
 * 
 * @basepath /health/
 */
export default class AdminController extends HtmlController {

    private md = require('markdown-it')({
        html: true,
        linkify: true,
        typographer: true
    });

    /*** Define routes */
    protected routes(): void {
        this.app.get("/", this.index);
        this.app.get("/update/", this.update);
        this.app.get("/compile/", this.compile);
        this.app.get("/compile/:level1/", this.compile);
        this.app.get("/compile/:level1/:level2/", this.compile);
        this.router.use("/", this.app);
    }


    /**
     * List repositories.
     *
     * @param req { Request } The request object.
     * @param res { Response } The response object.
     * @return html
     */
    private index = (req: Request, res: Response): void => {
        this.render(req, res, "repositories");
    };

    /**
     * Index view.
     *
     * @param req { Request } The request object.
     * @param res { Response } The response object.
     * @return html
     */
    private clone = (req: Request, res: Response): void => {
        //const git = require('simple-git/promise')(this.jsloth.context.baseURL + 'repos/OpenCharts');
        const remote = `https://github.com/unicoderns/OpenCharts.git`;

        console.log(this.jsloth.context.baseURL + 'repos/');

        require('simple-git/promise')(this.jsloth.context.baseURL + 'repos/').silent(true)
            .clone(remote)
            .then(() => console.log('finished'))
            .catch((err: any) => console.error('failed: ', err));
        this.render(req, res, "repositories");
    };

    /**
     * Index view.
     *
     * @param req { Request } The request object.
     * @param res { Response } The response object.
     * @return html
     */
    private update = (req: Request, res: Response): void => {
        require('simple-git/promise')(this.jsloth.context.baseURL + 'repos/OpenCharts')
            .pull('origin', 'master', { '--no-rebase': null });
        this.render(req, res, "repositories");
    };

    /**
     * Index view.
     *
     * @param req { Request } The request object.
     * @param res { Response } The response object.
     * @return html
     */
    private compile = (req: Request, res: Response): void => {
        let main = this;
        var fs = require('fs');
        fs.readFile(this.jsloth.context.baseURL + "repos/OpenCharts/docs/index.md", function (err: any, data: any) {
            if (err) {
                throw err;
            }
            let result = main.md.render(data.toString());
            main.render(req, res, "md", { 'main': result });
        });

    };
}