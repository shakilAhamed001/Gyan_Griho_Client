import { useContext } from "react";
import { Link, useNavigate } from "react-router";
import { Bounce, toast } from "react-toastify";
import { AuthContext } from "../../providers/AuthProvider";

const Register = () => {
  const { setUser, createUser, profileUpdate } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    const form = e.target;
    const name = form.name.value;
    // const photo = form.photoUrl.value;
    const email = form.email.value;
    const password = form.password.value;

    // console.log(name, photo, email, password);

    const regex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

    if (regex.test(password) === false) {
      const notify = () =>
        toast.error(
          "Password must contain uppercase, and lowercase letters, and be at least 6 characters long.",
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
          }
        );
      notify();
      return;
    }

    // register With Email And Password
    createUser(email, password)
      .then((result) => {
        console.log(result.user);
        setUser(result.user);

        profileUpdate({ displayName: name })
          .then(() => {
            console.log("profile updated");
          })
          .catch((error) => {
            console.log(error, "error");
          });

        navigate("/");

        const notify = () =>
          toast.success("Registration Successful", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
          });
        notify();
      })
      .catch((error) => {
        console.log(error.code, "error code");
      });
  };
  return (
    <div className="flex justify-center pb-20">
      <div className="card bg-base-100 top-10 w-11/12 md:w-[850px] shrink-0 border-4 border-black rounded-none p-5 md:p-20 pb-10 mb-10">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-black text-center">
          Register your account
        </h1>
        <div className="divider my-7 md:my-14"></div>
        <form onSubmit={handleRegister} className="card-body pt-0">
          <div className="fieldset">
            <label className="label">
              <span className="label-text text-xl md:text-2xl font-semibold">
                Name
              </span>
            </label>
            <input
              type="text"
              placeholder="your name"
              name="name"
              className="input input-bordered rounded-none w-full"
              required
            />
          </div>
          {/* <div className="fieldset">
            <label className="label">
              <span className="label-text text-xl md:text-2xl font-semibold">
                Photo URL
              </span>
            </label>
            <input
              type="text"
              placeholder="photo-url"
              name="photoUrl"
              className="input input-bordered rounded-none w-full"
              required
            />
          </div> */}
          <div className="fieldset">
            <label className="label">
              <span className="label-text text-xl md:text-2xl font-semibold">
                Email address
              </span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="email"
              className="input input-bordered rounded-none w-full"
              required
            />
          </div>
          <div className="fieldset">
            <label className="label">
              <span className="label-text text-xl md:text-2xl font-semibold">
                Password
              </span>
            </label>
            <button type="button" className="flex justify-end w-[95%]">
              {/* {showPassword ? (
                <FaEye className=" absolute top-[490px] md:top-[608px]" />
              ) : (
                <FaEyeSlash className=" absolute top-[490px] md:top-[608px]" />
              )} */}
            </button>
            <input
              type={"password"}
              name="password"
              placeholder="password"
              className="input input-bordered rounded-none w-full"
              required
            />
            {/* {errorMessage ? <p className="text-red-500">{errorMessage}</p> : ""} */}
            <label className="label">
              <a href="#" className="label-text-alt link link-hover">
                Forgot password?
              </a>
            </label>
          </div>
          {/* <div className="form-control">
            <label
              className="label cursor-pointer justify-start gap-3
              "
            >
              <input type="checkbox" className="checkbox checkbox-primary" />
              <span className="label-text font-semibold text-[#706F6F]">
                Accept Term & Conditions
              </span>
            </label>
          </div> */}
          <div className="fieldset">
            <button className="btn text-white text-xl  bg-black rounded-none border-none">
              Register
            </button>
          </div>
        </form>
        <Link
          to={"/auth/login"}
          className="font-semibold text-[#706F6F] text-center"
        >
          Already Have An Account ? <span className="text-red-500">Login</span>
        </Link>
      </div>
    </div>
  );
};

export default Register;
