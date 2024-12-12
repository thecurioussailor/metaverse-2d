import axios from "axios";

const BACKEND_URL = "http://localhost:3000";

describe("Authentication", () => {
    test("User is able to sign up only once", async () => {
        const username = "kirat" + Math.random();
        const password = "123456";

        const response = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
            username,
            password,
            type: "admin"
        });

        expect(response.statusCode).toBe(200);

        const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
            username,
            password,
            type: "admin"
        });

        expect(updatedResponse.statusCode).toBe(400);


    })

    test("Signup request fails if the username is empty", async () => {
        const username = `kirat-${Math.random()}`;
        const password = "123456";

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            password
        })

        expect(response.statusCode).toBe(400);
    })

    test("Signin succeeds if the username and password are correct", async () => {
        const username = `kirat-${Math.random()}`;
        const password = "123456";

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password
        });
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username,
            password
        })

        expect(response.statusCode).toBe(200);
        expect(response.body.token).toBeDefined();
    })

    test("Signin fails if username and password are incorrect", async () => {
        const username = `kirat-${Math.random()}`
        const password = "123456";

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password
        });

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: "WrongUsername",
            password
        })

        expect(response.statusCode).toBe(403);


    })
})

describe("User metadata endpoint", () => {
    let token = ""
    let avatarId = ""
    beforeAll(async () => {
        const username = `kirat-${Math.random()}`;
        const password = "123456";

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        });

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        token = response.data.token;

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl": "https://encrypted-image",
            name: "Timmy"
        })

        avatarId = avatarResponse.data.avatarId;
    })
    test("User can't update their metadata with a wrong avatar id", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId: "123456564"
        }, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        expect(response.statusCode).toBe(400);
    })

    test("User can update their metadata with the right avatar id", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId: "123456564"
        }, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        expect(response.statusCode).toBe(200);
    })

    test("User is not able to update their metadata if the auth header is not present", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId: "123456564"
        })
        expect(response.statusCode).toBe(403);
    })
});

describe("User avatar information", () => {
    let token = ""
    let avatarId = ""
    let userId;
    beforeAll(async () => {
        const username = `kirat-${Math.random()}`;
        const password = "123456";

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        });
        userId = signupResponse.data.userId;
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        token = response.data.token;

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "imageUrl": "https://encrypted-image",
            name: "Timmy"
        })

        avatarId = avatarResponse.data.avatarId;
    })

    test("Get back avatar information for a user", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`);

        expect(response.data.avatars.length).toBe(1);
        expect(reponse.data.avatars[0].userId).toBe(userId);

    })

    test("Available avatar lists the recently created avatar ", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);
        
        expect(response.data.avatars.length).not.toBe(0);
        const currentAvatar = response.data.avatars.find(x => x.id == avatarId);
        expect(currentAvatar).toBeDefined;
        
    })
})

describe("Space information", () => {
    let mapId;
    let element1Id;
    let element2Id;
    let adminToken;
    let adminId;
    let userToken;
    let userId;
    beforeAll(async () => {
        const username = `kirat-${Math.random()}`;
        const password = "123456";

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        });

        adminId = signupResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        adminToken = response.data.token;

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + "-user",
            password,
            type: "admin"
        });

        userId = userSignupResponse.data.userId;

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + "-user",
            password
        })

        userToken = userSigninResponse.data.token;

        const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        element1Id = element1.id;
        element2Id = element2.id;

        const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": [{
                    elementId: element1Id,
                    x: 20,
                    y: 20
                }, {
                  elementId: element1Id,
                    x: 18,
                    y: 20
                }, {
                  elementId: element2Id,
                    x: 19,
                    y: 20
                }
            ]
         }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
         })

         mapId = map.id;

    })

    test("User is able to create a space", async () => {
        const response = axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200",
            "mapId": mapId
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })
        expect(response.spaceId).toBeDefined();
    })

    test("User is able to create a space without mapId (empty space)", async () => {
        const response = axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200",
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })
        expect(response.data.spaceId).toBeDefined();
    })
    test("User is not able to create a space without mapId and dimensions", async () => {
        const response = axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test"
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })
        expect(response.statusCode).toBe(400);
    })

    test("User is able to delete a space that does not exist", async () => {

        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200"
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })
        const deleteResponse = axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        expect(deleteResponse.statusCode).toBe(200);
    })
     
    test("User should not be able to delete a space created by another user", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200"
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })
        const deleteResponse = axios.delete(`${BACKEND_URL}/api/v1/space/${response.data.spaceId}`, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        });
        expect(deleteResponse.statusCode).toBe(200);
    })

    test("Admin has no spaces initially", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space/all`, {
                headers: {
                    Authorization: `Bearer ${userToken}`
                }
            })

        expect(response.data.spaces.length).toBe(0);
    })

    test("Admin has no spaces initially", async () => {
        const spaceCreateResponse = await axios.post(`${BACKEND_URL}/api/v1/space/`,
            {
                "name": "Test",
                "dimensions": "100x200",
            }, {
                headers: {
                    Authorization: `Bearer ${userToken}`
                }
            })
        
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });
        const filteredSpace = response.data.spaces.find(x => x.id == spaceCreateResponse.spaceId);
        expect(response.data.spaces.length).toBe(1)
        expect(filteredSpace).toBeDefined()
    })

})

describe("Arena Endpoints", () => {
    let mapId;
    let element1Id;
    let element2Id;
    let adminToken;
    let adminId;
    let userToken;
    let userId;
    let spaceId;
    beforeAll(async () => {
        const username = `kirat-${Math.random()}`;
        const password = "123456";

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        });

        adminId = signupResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        adminToken = response.data.token;

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + "-user",
            password,
            type: "admin"
        });

        userId = userSignupResponse.data.userId;

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + "-user",
            password
        })

        userToken = userSigninResponse.data.token;

        const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        })

        const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        element1Id = element1.id;
        element2Id = element2.id;

        const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": [{
                    elementId: element1Id,
                    x: 20,
                    y: 20
                }, {
                  elementId: element1Id,
                    x: 18,
                    y: 20
                }, {
                  elementId: element2Id,
                    x: 19,
                    y: 20
                }
            ]
         }, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
         })

         mapId = map.id;

         const space = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200",
            "mapId": mapId
         }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
         })

         spaceId = space.spaceId;
    })

    test("Incorrect spaceId returns a 400", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/123kashdk01`, {
            Authorization: `Bearer ${userToken}`
        });
        expect(response.statusCode).toBe(400);
    })

    test("Correct spaceId returns all the elements", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
            Authorization: `Bearer ${userToken}`
        });
        expect(response.data.dimensions).toBe("100x200");
        expect(response.data.elements.length).toBe(3)
    })

    test("Delete endpoint to delete an element", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            Authorization: `Bearer ${userToken}`
        });
        await axios.delete(`${BACKEND_URL}/api/v1/space/element`,{
            spaceId: spaceId,
            elementId: response.data.elements[0].id 
        }, {
            Authorization: `Bearer ${userToken}`
        });

        const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            Authorization: `Bearer ${userToken}`
        });
        expect(response.data.elements.length).toBe(2)
    })

    test("Adding an element fails if the element lies outside the dimension", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
            "elementId": "chair1",
            "spaceId": "123",
            "x": 10000,
            "y": 210000
        }, {
            Authorization: `Bearer ${userToken}`
        });
        expect(response.statusCode).toBe(400)
    })
    test("Adding an element works as expected", async () => {
        await axios.post(`${BACKEND_URL}/api/v1/space/element`, {
            "elementId": element1Id,
            "spaceId": spaceId,
            "x": 50,
            "y": 20
        }, {
            Authorization: `Bearer ${userToken}`
        });

        const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            Authorization: `Bearer ${userToken}`
        });
        expect(response.data.elements.length).toBe(3)
    })

})

describe('Admin/Map Creator endpoints', () => {
    let adminToken;
    let adminId;
    let userToken;
    let userId;
    beforeAll(async () => {
        const username = `kirat-${Math.random()}`;
        const password = "123456";

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        });

        adminId = signupResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        })

        adminToken = response.data.token;

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username: username + "-user",
            password,
            type: "user"
        });

        userId = userSignupResponse.data.userId;

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: username + "-user",
            password
        })

        userToken = userSigninResponse.data.token;
    })

    test("User is not able to hit admin endpoints", async () => {
        const elementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
            "static": true // weather or not the user can sit on top of this element (is it considered as a collission or not)
        }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        });

        const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": []
         }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
         })

         const createAvatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": []
         }, {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
         })
         expect(elementResponse.statusCode).toBe(403);
         expect(mapResponse.statusCode).toBe(403);
    })

})
