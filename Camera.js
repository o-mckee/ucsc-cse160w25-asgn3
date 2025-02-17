class Camera {
    constructor() {
        this.eye = new Vector3([0.0, 1.0, -2.0]);
        this.at = new Vector3([0.0, 1.0, 0.0]);
        this.up = new Vector3([0.0, 1.0, 0.0]);
    }

    moveForward() {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(1); // speed (set to 1 currently)
        this.at.add(f);
        this.eye.add(f);
    }

    moveBackwards() {
        var b = new Vector3();
        b.set(this.eye);
        b.sub(this.at);
        b.normalize();
        b.mul(1); // speed (set to 1 currently)
        this.at.add(b);
        this.eye.add(b);
    }

    moveLeft() {
        var f = new Vector3();
        f.set(this.eye);
        f.sub(this.at);
        f.normalize();
        var s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(1); // speed (set to 1 currently)
        this.at.add(s);
        this.eye.add(s);
    }

    moveRight() {
        var f = new Vector3();
        f.set(this.eye);
        f.sub(this.at);
        f.normalize();
        var s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(1); // speed (set to 1 currently)
        this.at.add(s);
        this.eye.add(s);
    }

    panLeft() {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(10, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var f_prime = rotationMatrix.multiplyVector3(f);
        var temp = new Vector3();
        temp.set(this.eye);
        this.at.set(temp.add(f_prime));
    }

    panRight() {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-10, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var f_prime = rotationMatrix.multiplyVector3(f);
        var temp = new Vector3();
        temp.set(this.eye);
        this.at.set(temp.add(f_prime));
    }
}