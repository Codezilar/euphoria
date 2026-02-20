import { GrMoney } from "react-icons/gr";
import { GiShoppingCart } from "react-icons/gi";
import { GrDeliver } from "react-icons/gr";
import { ImGift } from "react-icons/im";
import Fx from "@/components/Fx";
import Order from "@/components/Order";

const page = () => {
  return (
      <div className="category_post">
        <div className="upload_container">
          <div className="dashboard_title">
            <h1>Euphoria Dashboard!</h1>
          </div>
          <div className="flex gap-2">
              <div className="card_items_admin animate-pulse bg-neutral-800">
                <span>
                  <GrMoney />
                </span>
                <div className="detail_card">
                  <h1>₦20,000,000</h1>
                  <p>Total Earnings</p>
                </div>
              </div>
              <div className="card_items_admin animate-pulse bg-neutral-800">
                <span>
                  <ImGift />
                </span>
                <div className="detail_card">
                  <h1>200</h1>
                  <p>Delivered</p>
                </div>
              </div>
              <div className="card_items_admin animate-pulse bg-neutral-800">
                <span>
                  <GrDeliver />
                </span>
                <div className="detail_card">
                  <h1>1,000</h1>
                  <p>Processing Delivery</p>
                </div>
              </div>
              <div className="card_items_admin animate-pulse bg-neutral-800">
                <span>
                  <GiShoppingCart />
                </span>
                <div className="detail_card">
                  <h1>23</h1>
                  <p>Pending Orders</p>
                </div>
              </div>
          </div>
          <div className="flex mt-6 flex-1 gap-2">
              <div className="adim_home_body flex flex-col gap-[10rem] h-full w-full p-[1rem] rounded-lg bg-neutral-800">
                {/* item */}
              </div>
          </div>
        </div>
      </div>
  );
};

export default page