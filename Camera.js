class Camera {
    constructor() {
        this.eye = new Vector3([0.0, 0.0, -2.0]);
        this.at = new Vector3([0.0, 0.0, 0.0]);
        this.up = new Vector3([0.0, 1.0, 0.0]);
    }

    forward() {
        var temp = new Vector3();
        temp.set(this.at);

        var f = temp.sub(this.eye);
        f.normalize();
        this.at.add(f);
        this.eye.add(f);
    }

    back() {
        var temp = new Vector3();
        temp.set(this.eye);

        var f = temp.sub(this.at);
        f.normalize();
        this.at.add(f);
        this.eye.add(f);
    }

    left() {
        var temp = new Vector3();
        temp.set(this.eye);

        var f = temp.sub(this.at);
        f.normalize();
        var s = cross(f, this.up);
        s.normalize();
        this.at.add(s);
        this.eye.add(s);
    }

    right() {
        var temp = new Vector3();
        temp.set(this.at);

        var f = temp.sub(this.eye);
        f.normalize();
        var s = cross(f, this.up);
        s.normalize();
        this.at.add(s);
        this.eye.add(s);
    }
}