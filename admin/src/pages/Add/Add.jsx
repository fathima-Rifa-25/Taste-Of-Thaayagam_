// React default import not required with automatic JSX runtime
import { useState } from "react";
import { useI18n } from '../../i18n/context';
import "./Add.css";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { FOOD_API } from "../../services/api"; // <-- use correct API

const Add = () => {
  const [image, setImage] = useState(false);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad",
  });
  const { t } = useI18n() || { t: (k) => k };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!image) {
      toast.error("Image not selected");
      return null;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    formData.append("image", image);

    const response = await axios.post(`${FOOD_API}/add`, formData); // <-- fixed to use correct API

    if (response.data.success) {
      toast.success(response.data.message);
      setData({
        name: "",
        description: "",
        price: "",
        category: data.category,
      });
      setImage(false);
    } else {
      toast.error(response.data.message);
    }
  };

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  return (
    <div className="page-container">
      {
        <div className="add">
          <form className="flex-col" onSubmit={onSubmitHandler}>
            <div className="add-img-upload flex-col">
              <p>{t('uploadImage') || 'Upload image'}</p>
              <input
                onChange={(e) => {
                  setImage(e.target.files[0]);
                  e.target.value = "";
                }}
                type="file"
                accept="image/*"
                id="image"
                hidden
              />
              <label htmlFor="image">
                <img
                  src={!image ? assets.upload_area : URL.createObjectURL(image)}
                  alt=""
                />
              </label>
            </div>
            <div className="add-product-name flex-col">
              <p>{t('productName') || 'Product name'}</p>
              <input
                name="name"
                onChange={onChangeHandler}
                value={data.name}
                type="text"
                placeholder={t('typeHere') || 'Type here'}
                required
              />
            </div>
            <div className="add-product-description flex-col">
              <p>{t('productDescription') || 'Product description'}</p>
              <textarea
                name="description"
                onChange={onChangeHandler}
                value={data.description}
                type="text"
                rows={6}
                placeholder={t('writeHere') || 'Write content here'}
                required
              />
            </div>
            <div className="add-category-price">
              <div className="add-category flex-col">
                <p>{t('productCategory') || 'Product category'}</p>
                <select name="category" onChange={onChangeHandler}>
                  <option value="Starter">Starter</option>
                  <option value="Biryani">Biryani</option>
                  <option value="Rice">Rice</option>
                  <option value="Curry">Curry</option>
                  <option value="Thali">Thali</option>
                  <option value="Mandhi">Mandhi</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Desserts">Desserts</option>
                </select>
              </div>
              <div className="add-price flex-col">
                <p>{t('productPrice') || 'Product Price'}</p>
                <input
                  type="Number"
                  name="price"
                  onChange={onChangeHandler}
                  value={data.price}
                  placeholder={t('pricePlaceholder') || '25'}
                />
              </div>
            </div>
            <button type="submit" className="add-btn">
              {t('addBtn') || 'ADD'}
            </button>
          </form>
        </div>
      }
    </div>
  );
};

export default Add;
